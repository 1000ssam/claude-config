const fs = require('fs');
const mod = fs.readFileSync('C:/dev/notes/개인정보동의서_보강.xml', 'utf-8');

// XSL href가 파일명과 일치하는지 확인
const xslHref = mod.match(/href="([^"]+\.xsl)"/);
console.log('XSL href:', xslHref ? xslHref[1] : 'none');

// BOM 확인
console.log('BOM:', mod.charCodeAt(0) === 0xFEFF ? 'YES (UTF-8 BOM)' : 'NO');

// 파일명과 XSL href 불일치 확인
console.log('XML 파일명: 개인정보동의서_보강.xml');
console.log('XSL 파일명:', xslHref ? xslHref[1] : 'N/A');
console.log('불일치:', xslHref && xslHref[1] !== '개인정보동의서_보강.xsl' ? 'YES - 이게 문제!' : 'NO');

// XSL 파일 존재 확인
const xslPath = 'C:/dev/notes/' + (xslHref ? xslHref[1] : '');
console.log('XSL 존재:', fs.existsSync(xslPath) ? 'YES' : 'NO - 이게 문제!');
