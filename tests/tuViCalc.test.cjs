const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
const { calculateTuViChart: chart } = require('../src/services/tuViCalc.ts');
const { solarToLunar } = require('../src/services/lunarCalendar.ts');
const { majorStarStatus } = require('../src/data/tuViRules.ts');
const findStar = (c, name) => c.palaces.find(p => [...p.majorStars, ...p.goodStars, ...p.badStars].some(s => s.name === name));

test('18/08/1998, nam giờ Ngọ: regression for reviewed chart', () => {
  // https://xskt.com.vn/lich-am-van-nien/ngay/18-8-1998
  const c = chart('', 18, 8, 1998, 6, 'Nam');
  assert.deepEqual(c.lunarDate, { day: 27, month: 6, year: 1998, isLeap: false });
  assert.equal(c.menhLocation, 'Cung Sửu');
  assert.equal(c.palaces.find(p => p.isThan).branchId, 1);
  assert.equal(c.cucName, 'Kim Tứ Cục');
  assert.equal(c.canChiHour, 'Bính Ngọ');
  assert.match(c.napAm, /^Thành Đầu Thổ/);
  assert.equal(findStar(c, 'Tử Vi').branchName, 'Mùi');
  assert.equal(c.palaceByBranch[2].id, 'phu_mau');
  assert.equal(c.palaceByBranch[0].id, 'huynh_de');
  assert.equal(c.palaceByBranch[1].daiHan, '4 - 13');
  assert.equal(c.palaceByBranch[2].daiHan, '14 - 23');
  assert.equal(chart('', 18, 8, 1998, 6, 'Nữ').palaceByBranch[0].daiHan, '14 - 23');
});

test('Vietnamese calendar boundaries and leap months', () => {
  const cases = [
    [9, 2, 2024, 30, 12, 2023, false], [10, 2, 2024, 1, 1, 2024, false],
    [22, 3, 2023, 1, 2, 2023, true], [19, 4, 2023, 29, 2, 2023, true],
    [20, 4, 2023, 1, 3, 2023, false], [29, 1, 2025, 1, 1, 2025, false],
    // Vietnam and China differ on this date: must use UTC+7.
    [22, 1, 2023, 1, 1, 2023, false], [16, 2, 2007, 29, 12, 2006, false],
    [17, 2, 2007, 1, 1, 2007, false],
  ];
  for (const [d,m,y,day,month,year,isLeap] of cases) assert.deepEqual(solarToLunar(d,m,y), {day,month,year,isLeap}, `${d}/${m}/${y}`);
  assert.equal(chart('',9,2,2024,0,'Nam').canChiYear, 'Quý Mão');
  assert.equal(chart('',10,2,2024,0,'Nam').canChiYear, 'Giáp Thìn');
});

test('invalid inputs never generate a chart', () => {
  for (const [d,m,y] of [[31,2,1998],[29,2,1900],[18,99,1998],[0,1,2000],[1,1,1799],[1,1,2200],[NaN,1,2000],[1,1.5,2000]]) assert.throws(() => chart('',d,m,y,0,'Nam'));
  for (const hour of [-1,12,1.5,NaN]) assert.throws(() => chart('',1,1,2000,hour,'Nam'));
  assert.doesNotThrow(() => chart('',29,2,2000,0,'Nam'));
});

test('60 years × 12 hours: all stars unique; Tứ Hóa follows its source, 12 palaces, valid status', () => {
  for (let year=1960; year<2020; year++) for (let hour=0; hour<12; hour++) {
    const c = chart('',18,8,year,hour,'Nam');
    const stars = c.palaces.flatMap(p=>p.majorStars);
    assert.equal(stars.length,14);
    assert.equal(new Set(stars.map(s=>s.name)).size,14);
    assert.equal(new Set(c.palaces.map(p=>p.branchId)).size,12);
    assert.equal(c.palaces.filter(p=>p.isThan).length,1);
    assert.ok(stars.every(s=>s.status));
    const hoa = c.palaces.flatMap(p=>[...p.goodStars,...p.badStars].filter(s=>s.name.startsWith('Hóa ')).map(s=>({p,s})));
    assert.equal(hoa.length,4);
    hoa.forEach(({p,s})=>assert.equal(findStar(c,s.name.match(/\((.+)\)/)[1]).branchId,p.branchId));
  }
  assert.equal(majorStarStatus('Thái Dương',0),'Hãm');
  assert.equal(majorStarStatus('Thái Dương',6),'Miếu');
});
