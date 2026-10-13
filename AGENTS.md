# Workspace Rules for RSBK Online (`rsbk-online.web.app`)

1. **Automatic GitHub Backup**:
   - After **every** Firebase deployment or **every time** any change, update, or addition is made to the website, you MUST stage, commit, and push all changes to GitHub (`https://github.com/MilindChatrabhuji/RSBK-web.git` on branch `main`).
   - Run `git add -A && git commit -m "<descriptive message>" && git push origin main` in `D:\Dr Milind Chatrabhuji\Books Authored by me\RSBK.web.app`.

2. **Drive Usage Constraint**:
   - **NEVER** use the `C:` drive for installing tools, temp files, or storing project assets. Always use the `D:` drive exclusively.
   - Portable Node.js and Firebase CLI are located in `D:\temp\node-v20.12.0-win-x64` and `D:\temp\RSBK.web.app`. When deploying via `D:\temp\RSBK.web.app`, always ensure `D:\Dr Milind Chatrabhuji\Books Authored by me\RSBK.web.app` has the exact same updated files before committing and pushing to GitHub.

3. **Firebase Hosting Target & Version Retention**:
   - Project ID: `rsbk-online`
   - Live URL: `https://rsbk-online.web.app`
   - Version Retention (`retainedReleaseCount`): Set to `1` (only the latest live deployment is stored in Firebase Hosting; all older versions are deleted).
