const path = require('node:path');

const SOLUTION = 'src/Takt.Backend/Takt.Backend.slnx';

// dotnet format --include wants solution-relative, forward-slash paths.
const toIncludeArgs = (files) =>
  files.map((f) => path.relative(process.cwd(), f).replace(/\\/g, '/')).join(' ');

module.exports = {
  '**/*.{cs,csproj,props}': (files) => [
    `dotnet format ${SOLUTION} --no-restore --include ${toIncludeArgs(files)}`,
  ],
};
