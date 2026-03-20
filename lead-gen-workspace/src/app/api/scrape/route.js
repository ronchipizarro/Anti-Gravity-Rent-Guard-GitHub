import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(req) {
  try {
    const { campaignId, geography } = await req.json();
    if (!campaignId || !geography) {
      return NextResponse.json({ success: false, error: 'Missing campaignId or geography' }, { status: 400 });
    }

    // Map geography to Compass slug
    const cityMap = {
      "miami": "miami",
      "fort lauderdale": "fort-lauderdale",
      "orlando": "orlando",
      "naples": "naples",
      "tampa": "tampa",
      "west palm beach": "west-palm-beach",
      "boca raton": "boca-raton",
      "coral gables": "coral-gables"
    };

    const searchKey = geography.toLowerCase().split(',')[0].trim();
    const citySlug = cityMap[searchKey];

    if (!citySlug) {
      return NextResponse.json({ success: false, error: `Geography '${geography}' not supported by scraper. Use Miami, Orlando, etc.` }, { status: 400 });
    }

    const scraperPath = path.join(process.cwd(), '..', 'lead_gen_agent', 'lead_gen.py');
    const projectRoot = path.join(process.cwd(), '..');
    
    // Trigger Python scraper in quick mode for the specific city
    // Run: python lead_gen.py --quick (which selects Miami) 
    // BUT we want to pass the city. The script doesn't currently take arbitrary cities via CLI easily 
    // unless I modify it or use the --quick logic.
    // Let's modify lead_gen.py slightly to accept a --city argument or just use --quick if it's Miami.

    // Actually, I'll update lead_gen.py to accept --city slug
    
    return new Promise((resolve) => {
      // For this MVP, we'll run it and wait for the latest CSV in the output folder
      const pythonProcess = spawn('python', [scraperPath, '--city', citySlug, '--max-pages', '1'], {
        cwd: path.join(projectRoot, 'lead_gen_agent')
      });

      let output = '';
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
        console.log(`Scraper: ${data}`);
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error(`Scraper Error: ${data}`);
      });

      pythonProcess.on('close', async (code) => {
        if (code === 0) {
          // Find the CSV path in the output
          const match = output.match(/\[Success\] Exported to: (.*\.csv)/);
          if (!match) {
            return resolve(NextResponse.json({ success: false, error: 'Could not find export path in scraper output', output }, { status: 500 }));
          }

          const csvPath = match[1].trim();
          
          try {
            const fs = require('fs');
            const Papa = require('papaparse');
            const csvData = fs.readFileSync(csvPath, 'utf8');
            const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
            
            const db = getDb();
            let inserted = 0;
            let duplicates = 0;

            const insertStmt = db.prepare(`
              INSERT INTO leads (company_name, website, city, state, address, phone, generic_email, contact_name, contact_role, contact_email, source, campaign_id, pipeline_status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'imported')
            `);

            const checkStmt = db.prepare(`SELECT id FROM leads WHERE (company_name = ? AND contact_name = ?) OR contact_email = ?`);

            const transaction = db.transaction((rows) => {
              for (const row of rows) {
                // Compass CSV headers: full_name, email, phone, company, title, city, source, profile_url, outreach_status, notes, date_added
                const existing = checkStmt.get(row.company, row.full_name, row.email);
                if (existing) {
                  duplicates++;
                  continue;
                }

                insertStmt.run(
                  row.company || 'Compass',
                  row.website || '',
                  row.city || 'Miami',
                  'FL',
                  '', // address
                  row.phone || '',
                  row.email || '', // generic
                  row.full_name || '',
                  row.title || 'Real Estate Agent',
                  row.email || '', // contact
                  'Compass Scraper',
                  campaignId
                );
                inserted++;
              }
            });

            transaction(parsed.data);
            resolve(NextResponse.json({ success: true, inserted, duplicates, output }));
          } catch (importError) {
            resolve(NextResponse.json({ success: false, error: `Import failed: ${importError.message}`, output }, { status: 500 }));
          }
        } else {
          resolve(NextResponse.json({ success: false, error: `Scraper exited with code ${code}`, output }, { status: 500 }));
        }
      });
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
