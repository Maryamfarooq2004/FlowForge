import fs from 'fs';
import path from 'path';

const servicePath = 'd:/FYP/FYP_implemenation/server/src/services/auth.service.ts';
const imports = [
  '../models/User.model',
  '../utils/AppError',
  '../utils/jwt.utils'
];

console.log(`Checking imports for: ${servicePath}`);

imports.forEach(imp => {
  const absolutePath = path.resolve(path.dirname(servicePath), imp);
  const tsPath = absolutePath + '.ts';
  const exists = fs.existsSync(tsPath);
  
  if (exists) {
    const realPath = fs.realpathSync.native(tsPath);
    console.log(`[OK] ${imp} -> Found as: ${realPath}`);
    if (realPath.toLowerCase() === tsPath.toLowerCase() && realPath !== tsPath) {
      console.error(`[WARNING] Case mismatch! Expected: ${tsPath}, Found: ${realPath}`);
    }
  } else {
    console.error(`[ERROR] ${imp} -> NOT FOUND at: ${tsPath}`);
  }
});
