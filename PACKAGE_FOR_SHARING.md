# Package for Sharing - Standalone Docker Setup

## Files to Share

Create a ZIP file with these files:

```
Employee-Management-App/
├── docker-compose.standalone.yml    <-- Main file
├── backend/
│   ├── Dockerfile.standalone
│   ├── pom.xml
│   └── src/                         <-- All Java source code
├── frontend/
│   ├── Dockerfile.standalone
│   ├── nginx.conf
│   ├── package.json
│   ├── package-lock.json
│   ├── public/
│   └── src/                         <-- All React source code
└── README-RUN.md                    <-- Instructions
```

## Quick Package Commands (PowerShell)

```powershell
# Create a folder for sharing
New-Item -ItemType Directory -Force -Path "C:\Employee-Management-Share"

# Copy essential files
Copy-Item docker-compose.standalone.yml C:\Employee-Management-Share\
Copy-Item -Recurse backend C:\Employee-Management-Share\
Copy-Item -Recurse frontend C:\Employee-Management-Share\

# Create ZIP
Compress-Archive -Path C:\Employee-Management-Share\* -DestinationPath C:\Employee-Management-App.zip -Force
```

## On the Other System

1. **Extract the ZIP file**
2. **Open terminal in the folder**
3. **Run:**
   ```powershell
   docker-compose -f docker-compose.standalone.yml up --build
   ```
4. **Access:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8081

## That's It!

No need to install Java, Node.js, or Maven. Just Docker!
