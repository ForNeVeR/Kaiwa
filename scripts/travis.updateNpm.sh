set -e

function version_lt() {
    test "$(echo "$@" | tr " " "\n" | sort -V | head -n 1)" != "$2";
}

NPM_VERSION=$(npm --version)
if version_lt $NPM_VERSION 3 ; then
    npm install -g npm@^3
fi
