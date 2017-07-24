$ErrorActionPreference = 'Stop'

[Version] $npmVersion = npm --version
if ($npmVersion -lt '5.0') {
    npm install -g npm@^5
}
