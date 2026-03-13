# How to Set Up GitHub (Manual Steps)

Git is not currently installed on your computer, so I cannot run the initialization commands for you. Please follow these steps to get everything synced.

## 1. Install Git and GitHub CLI
Download and install these two tools:
*   **Git**: [https://git-scm.com/download/win](https://git-scm.com/download/win)
*   **GitHub CLI**: [https://cli.github.com/](https://cli.github.com/)

## 2. Initialize the Project
Once installed, open a terminal (PowerShell) in your project folder and run these commands one by one:

```powershell
# Initialize git
git init

# Create the repo on GitHub (replace YOUR_REPO_NAME)
gh repo create "Anti-Gravity-Rent-Guard" --public --source=. --remote=origin

# Stage your files
git add .

# Make your first commit
git commit -m "Initial commit from Antigravity"

# Push to GitHub
git push -u origin main
```

## 3. How to use `sync.ps1`
I have created a `sync.ps1` file in your root folder. Every time you want to save your work and sync it to other computers, just right-click it and select **"Run with PowerShell"**.

It will automatically:
1. Pull any new changes from GitHub.
2. Save your new work.
3. Push everything back to the cloud.
