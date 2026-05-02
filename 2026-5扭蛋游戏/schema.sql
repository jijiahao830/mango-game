CREATE TABLE IF NOT EXISTS game_data (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  record_type ENUM('customer','draw','referral') NOT NULL DEFAULT 'customer' COMMENT '记录类型：customer客户、draw中奖记录、referral邀请记录',

  name VARCHAR(50) DEFAULT NULL COMMENT '客户姓名',
  phone VARCHAR(20) DEFAULT NULL COMMENT '客户手机号',

  api_token VARCHAR(80) DEFAULT NULL COMMENT '接口登录令牌',
  referral_code VARCHAR(32) DEFAULT NULL COMMENT '客户专属邀请码',
  referred_by VARCHAR(32) DEFAULT NULL COMMENT '来源邀请码',
  quota_claimed TINYINT NOT NULL DEFAULT 0 COMMENT '后台配置次数是否已发放：0未发放，1已发放',

  basic_quota INT NOT NULL DEFAULT 0 COMMENT '后台配置的普通宝箱次数',
  advanced_quota INT NOT NULL DEFAULT 0 COMMENT '后台配置的高级宝箱次数',
  premium_quota INT NOT NULL DEFAULT 0 COMMENT '后台配置的传说宝箱次数',

  basic_opens INT NOT NULL DEFAULT 0 COMMENT '当前剩余普通宝箱抽奖次数',
  advanced_opens INT NOT NULL DEFAULT 0 COMMENT '当前剩余高级宝箱抽奖次数',
  premium_opens INT NOT NULL DEFAULT 0 COMMENT '当前剩余传说宝箱抽奖次数',

  pity_advanced INT NOT NULL DEFAULT 0 COMMENT '高级宝箱保底计数',
  pity_premium INT NOT NULL DEFAULT 0 COMMENT '传说宝箱保底计数',

  inviter_phone VARCHAR(20) DEFAULT NULL COMMENT '邀请人手机号',
  invitee_phone VARCHAR(20) DEFAULT NULL COMMENT '被邀请人手机号',

  tier ENUM('basic','advanced','premium') DEFAULT NULL COMMENT '抽奖宝箱类型',
  prize_id VARCHAR(50) DEFAULT NULL COMMENT '中奖奖品ID',
  prize_name VARCHAR(255) DEFAULT NULL COMMENT '中奖奖品名称',
  prize_rarity VARCHAR(50) DEFAULT NULL COMMENT '中奖奖品稀有度',
  prize_value INT NOT NULL DEFAULT 0 COMMENT '中奖奖品价值',

  remark VARCHAR(255) DEFAULT NULL COMMENT '备注',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  customer_phone VARCHAR(20) GENERATED ALWAYS AS (CASE WHEN record_type = 'customer' THEN phone ELSE NULL END) STORED COMMENT '客户手机号唯一索引辅助列',
  customer_token VARCHAR(80) GENERATED ALWAYS AS (CASE WHEN record_type = 'customer' THEN api_token ELSE NULL END) STORED COMMENT '登录令牌唯一索引辅助列',
  customer_referral_code VARCHAR(32) GENERATED ALWAYS AS (CASE WHEN record_type = 'customer' THEN referral_code ELSE NULL END) STORED COMMENT '邀请码唯一索引辅助列',
  referral_invitee_phone VARCHAR(20) GENERATED ALWAYS AS (CASE WHEN record_type = 'referral' THEN invitee_phone ELSE NULL END) STORED COMMENT '被邀请人手机号唯一索引辅助列',

  PRIMARY KEY (id),
  UNIQUE KEY uq_customer_phone (customer_phone),
  UNIQUE KEY uq_customer_token (customer_token),
  UNIQUE KEY uq_customer_referral (customer_referral_code),
  UNIQUE KEY uq_referral_invitee (referral_invitee_phone),
  KEY idx_phone (phone),
  KEY idx_referral_code (referral_code),
  KEY idx_inviter_phone (inviter_phone),
  KEY idx_record_type_created (record_type, created_at)
) COMMENT='宝箱抽奖单表：客户配置、邀请记录、中奖记录';
