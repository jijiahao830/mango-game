const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
try { require('dotenv').config(); } catch (_err) {}
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const configPath = path.join(__dirname, 'config.json');
const fileConfig = fs.existsSync(configPath)
  ? JSON.parse(fs.readFileSync(configPath, 'utf8'))
  : {};
const dbConfig = fileConfig.database || {};
const port = Number(fileConfig.port || process.env.PORT || 8090);

const pool = mysql.createPool({
  host: dbConfig.host || process.env.DB_HOST || '127.0.0.1',
  port: Number(dbConfig.port || process.env.DB_PORT || 3306),
  user: dbConfig.user || process.env.DB_USER || 'root',
  password: dbConfig.password || process.env.DB_PASSWORD || '',
  database: dbConfig.name || process.env.DB_NAME || 'car_case_game',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4'
});

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  const blockedFiles = new Set([
    'config.json',
    'server.js',
    'schema.sql',
    'package.json',
    'package-lock.json'
  ]);
  const pathname = decodeURIComponent(new URL(req.originalUrl, 'http://localhost').pathname);
  const filename = path.basename(pathname);
  if (filename.startsWith('.') || blockedFiles.has(filename)) {
    return res.sendStatus(404);
  }
  next();
});
app.use(express.static(__dirname, {
  dotfiles: 'deny',
  index: false
}));

const CASES = {
  basic: {
    prizes: [
      { id:'b1', name:'奔驰E300 1天免费使用权', icon:'supercar', rarity:'red', value:899, desc:'限周一至周四非法定节假日使用；提前3天预约；仅限本人使用', weight:0.5 },
      { id:'b2', name:'500元租车券（满3天可用）', icon:'couponPlus', rarity:'gold', value:500, desc:'满3000元可用；限工作日使用；单笔订单限用1张', weight:2 },
      { id:'b3', name:'8折租车券（最高减400元）', icon:'couponPlus', rarity:'purple', value:400, desc:'满1500元可用；不与其他优惠同享', weight:10 },
      { id:'b4', name:'85折租车券（最高减200元）', icon:'coupon', rarity:'blue', value:200, desc:'满1000元可用；不与其他优惠同享', weight:25 },
      { id:'b5', name:'免费车辆精洗+内饰消毒1次', icon:'clean', rarity:'green', value:198, desc:'取车/还车时可用；无门槛', weight:40 },
      { id:'b6', name:'定制车载香薰/高端挪车码', icon:'gift', rarity:'gray', value:188, desc:'到店自取；无使用门槛', weight:22.5 }
    ]
  },
  advanced: {
    prizes: [
      { id:'a1', name:'保时捷718/奔驰C63 1天免费使用权', icon:'supercar', rarity:'red', value:1299, desc:'限周一至周四非法定节假日使用；提前3天预约；仅限本人使用', weight:1 },
      { id:'a2', name:'1000元租车券（满5天可用）', icon:'ticket', rarity:'gold', value:1000, desc:'满5000元可用；长租专享；限工作日使用', weight:5 },
      { id:'a3', name:'75折租车券（最高减800元）', icon:'couponPlus', rarity:'purple', value:800, desc:'满2500元可用；不与其他优惠同享', weight:15 },
      { id:'a4', name:'8折租车券（最高减400元）', icon:'coupon', rarity:'blue', value:400, desc:'满1500元可用；不与其他优惠同享', weight:30 },
      { id:'a5', name:'免费机场/高铁接送服务1次', icon:'airport', rarity:'green', value:298, desc:'仅限与取车/还车订单绑定使用；限本市主城区', weight:39 },
      { id:'a6', name:'高端定制车载伴手礼盒', icon:'gift', rarity:'gray', value:268, desc:'到店自取；无使用门槛', weight:10 }
    ]
  },
  premium: {
    prizes: [
      { id:'p1', name:'兰博基尼/法拉利 1天免费使用权', icon:'supercar', rarity:'legend', value:4999, desc:'限周一至周四非法定节假日使用；提前5天预约；仅限本人使用', weight:1 },
      { id:'p2', name:'1500元长租抵扣券（满7天可用）', icon:'ticket', rarity:'red', value:1500, desc:'满7000元可用；不限使用时段', weight:16 },
      { id:'p3', name:'专属配驾服务1天（8小时）', icon:'driver', rarity:'gold', value:2400, desc:'仅限3天及以上长租订单绑定使用', weight:21 },
      { id:'p4', name:'7折租车券（最高减1200元）', icon:'couponPlus', rarity:'purple', value:1200, desc:'满3000元可用；不与其他优惠同享', weight:26 },
      { id:'p5', name:'免费全车精洗+内饰护理', icon:'clean', rarity:'silver', value:398, desc:'取车/还车时可用；无门槛', weight:21 },
      { id:'p6', name:'豪车尊享高端礼盒', icon:'gift', rarity:'bronze', value:888, desc:'到店自取；无使用门槛', weight:15 }
    ]
  }
};

function ok(res, data) {
  res.json({ ok: true, ...data });
}

function fail(res, status, message) {
  res.status(status).json({ ok: false, message });
}

function token() {
  return crypto.randomBytes(32).toString('hex');
}

function referralCode() {
  return 'MG' + crypto.randomBytes(5).toString('hex').toUpperCase();
}

function weightedRandom(prizes) {
  const total = prizes.reduce((sum, p) => sum + Number(p.weight || 0), 0);
  let r = Math.random() * total;
  for (const prize of prizes) {
    r -= Number(prize.weight || 0);
    if (r <= 0) return prize;
  }
  return prizes[prizes.length - 1];
}

function rollPrize(tier, user) {
  const prizes = CASES[tier].prizes;
  if (tier === 'advanced') {
    if (user.pity_advanced >= 19) return { prize: prizes.find(p => p.id === 'a1'), pityAdvanced: 0, pityPremium: user.pity_premium };
    const prize = weightedRandom(prizes);
    return { prize, pityAdvanced: prize.id === 'a1' ? 0 : user.pity_advanced + 1, pityPremium: user.pity_premium };
  }
  if (tier === 'premium') {
    if (user.pity_premium >= 39) return { prize: prizes.find(p => p.id === 'p1'), pityAdvanced: user.pity_advanced, pityPremium: 0 };
    const prize = weightedRandom(prizes);
    return { prize, pityAdvanced: user.pity_advanced, pityPremium: prize.id === 'p1' ? 0 : user.pity_premium + 1 };
  }
  return { prize: weightedRandom(prizes), pityAdvanced: user.pity_advanced, pityPremium: user.pity_premium };
}

async function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const apiToken = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!apiToken) return fail(res, 401, '请先输入姓名和手机号');
  const [rows] = await pool.query("SELECT * FROM game_data WHERE record_type='customer' AND api_token=? LIMIT 1", [apiToken]);
  if (!rows.length) return fail(res, 401, '登录已失效，请重新输入信息');
  req.user = rows[0];
  next();
}

async function getBalance(conn, userId) {
  const [rows] = await conn.query("SELECT basic_opens, advanced_opens, premium_opens FROM game_data WHERE record_type='customer' AND id=?", [userId]);
  const row = rows[0] || { basic_opens: 0, advanced_opens: 0, premium_opens: 0 };
  return {
    basicOpens: row.basic_opens,
    advancedOpens: row.advanced_opens,
    premiumOpens: row.premium_opens
  };
}

async function applyReferral(conn, user, ref, isNewUser) {
  if (!isNewUser) return;
  if (!ref || user.referred_by || ref === user.referral_code) return;
  const [inviterRows] = await conn.query("SELECT * FROM game_data WHERE record_type='customer' AND referral_code=? LIMIT 1", [ref]);
  if (!inviterRows.length || inviterRows[0].id === user.id) return;
  const inviter = inviterRows[0];
  const [countRows] = await conn.query("SELECT COUNT(*) AS c FROM game_data WHERE record_type='referral' AND inviter_phone=?", [inviter.phone]);
  if (countRows[0].c >= 5) return;
  await conn.query(
    "INSERT IGNORE INTO game_data (record_type, inviter_phone, invitee_phone, referral_code, name, phone) VALUES ('referral', ?, ?, ?, ?, ?)",
    [inviter.phone, user.phone, ref, user.name, user.phone]
  );
  const [insertRows] = await conn.query('SELECT ROW_COUNT() AS affected');
  if (insertRows[0].affected > 0) {
    await conn.query("UPDATE game_data SET referred_by=? WHERE record_type='customer' AND id=?", [ref, user.id]);
    await conn.query("UPDATE game_data SET basic_opens=basic_opens+1 WHERE record_type='customer' AND id IN (?, ?)", [inviter.id, user.id]);
  }
}

app.post('/api/login', async (req, res) => {
  const name = String(req.body.name || '').trim();
  const phone = String(req.body.phone || '').trim();
  const ref = String(req.body.ref || '').trim();
  if (!name) return fail(res, 400, '请输入姓名');
  if (name.length < 2) return fail(res, 400, '请输入完整姓名');
  if (!phone) return fail(res, 400, '请输入手机号');
  if (!/^1[3-9]\d{9}$/.test(phone)) return fail(res, 400, '手机号格式不正确，请输入11位手机号');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [existing] = await conn.query("SELECT * FROM game_data WHERE record_type='customer' AND phone=? LIMIT 1 FOR UPDATE", [phone]);
    let user = existing[0];
    let isNewUser = false;
    if (!user) {
      await conn.query(
        "INSERT INTO game_data (record_type, name, phone, api_token, referral_code) VALUES ('customer', ?, ?, ?, ?)",
        [name, phone, token(), referralCode()]
      );
      const [created] = await conn.query("SELECT * FROM game_data WHERE record_type='customer' AND phone=? LIMIT 1 FOR UPDATE", [phone]);
      user = created[0];
      isNewUser = true;
    } else if (user.name !== name) {
      await conn.rollback();
      return fail(res, 400, '姓名与手机号不匹配，请核对后再试');
    }

    if (!user.api_token || !user.referral_code) {
      user.api_token = user.api_token || token();
      user.referral_code = user.referral_code || referralCode();
      await conn.query(
        "UPDATE game_data SET api_token=?, referral_code=? WHERE record_type='customer' AND id=?",
        [user.api_token, user.referral_code, user.id]
      );
    }

    if (!user.quota_claimed) {
      await conn.query(
        "UPDATE game_data SET basic_opens=basic_opens+GREATEST(basic_quota, 1), advanced_opens=advanced_opens+advanced_quota, premium_opens=premium_opens+premium_quota, quota_claimed=1 WHERE record_type='customer' AND id=?",
        [user.id]
      );
      user.quota_claimed = 1;
    }

    await applyReferral(conn, user, ref, isNewUser);
    const balance = await getBalance(conn, user.id);
    const [inviteRows] = await conn.query("SELECT COUNT(*) AS c FROM game_data WHERE record_type='referral' AND inviter_phone=?", [user.phone]);
    await conn.commit();
    ok(res, {
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        token: user.api_token,
        referralCode: user.referral_code
      },
      balance,
      inviteCount: inviteRows[0].c
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    fail(res, 500, '登录失败，请稍后重试');
  } finally {
    conn.release();
  }
});

app.get('/api/me', auth, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const balance = await getBalance(conn, req.user.id);
    const [inviteRows] = await conn.query("SELECT COUNT(*) AS c FROM game_data WHERE record_type='referral' AND inviter_phone=?", [req.user.phone]);
    ok(res, {
      user: {
        id: req.user.id,
        name: req.user.name,
        phone: req.user.phone,
        referralCode: req.user.referral_code
      },
      balance,
      inviteCount: inviteRows[0].c
    });
  } finally {
    conn.release();
  }
});

app.post('/api/draw', auth, async (req, res) => {
  const tier = String(req.body.tier || '');
  if (!CASES[tier]) return fail(res, 400, '宝箱类型不存在');
  const column = tier === 'basic' ? 'basic_opens' : tier === 'advanced' ? 'advanced_opens' : 'premium_opens';
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [userRows] = await conn.query("SELECT * FROM game_data WHERE record_type='customer' AND id=? FOR UPDATE", [req.user.id]);
    const user = userRows[0];
    const [balanceRows] = await conn.query(`SELECT ${column} AS opens FROM game_data WHERE record_type='customer' AND id=? FOR UPDATE`, [user.id]);
    if (!balanceRows.length || balanceRows[0].opens <= 0) {
      await conn.rollback();
      return fail(res, 400, '当前宝箱暂无抽奖次数');
    }
    const rolled = rollPrize(tier, user);
    await conn.query(`UPDATE game_data SET ${column}=${column}-1, pity_advanced=?, pity_premium=? WHERE record_type='customer' AND id=?`, [rolled.pityAdvanced, rolled.pityPremium, user.id]);
    await conn.query(
      "INSERT INTO game_data (record_type, name, phone, tier, prize_id, prize_name, prize_rarity, prize_value) VALUES ('draw', ?, ?, ?, ?, ?, ?, ?)",
      [user.name, user.phone, tier, rolled.prize.id, rolled.prize.name, rolled.prize.rarity, rolled.prize.value]
    );
    const balance = await getBalance(conn, user.id);
    await conn.commit();
    ok(res, {
      prize: rolled.prize,
      balance,
      pity: { advanced: rolled.pityAdvanced, premium: rolled.pityPremium }
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    fail(res, 500, '抽奖失败，请稍后重试');
  } finally {
    conn.release();
  }
});

app.get('/api/awards', auth, async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, tier, prize_id, prize_name, prize_rarity, prize_value, created_at FROM game_data WHERE record_type='draw' AND phone=? ORDER BY created_at DESC, id DESC LIMIT 200",
    [req.user.phone]
  );
  ok(res, { awards: rows });
});

app.get('/api/admin/draw-records', async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, name, phone, tier, prize_name, prize_rarity, prize_value, created_at FROM game_data WHERE record_type='draw' ORDER BY id DESC LIMIT 200"
  );
  ok(res, { records: rows });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const server = app.listen(port, () => {
  console.log(`宝箱抽奖服务已启动：http://localhost:${port}`);
});

server.on('error', (err) => {
  console.error('服务启动失败：', err);
  process.exit(1);
});

setInterval(() => {}, 60 * 60 * 1000);
