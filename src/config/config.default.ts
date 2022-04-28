import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

import { IAccessLogConfig } from '../interface';

export type DefaultConfig = PowerPartial<EggAppConfig>;

export default (appInfo: EggAppInfo) => {
  const config = {} as DefaultConfig;

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1640593084642_6476';

  config.accessLogConfig = {
    ignore: [/\/swagger-u.*/u],
  } as IAccessLogConfig;

  // add your config here
  config.middleware = [
    'requestIdMiddleware',
    'formatMiddleware',
    'accessLogMiddleware',
    'errorHandlerMiddleware',
  ];

  config.midwayFeature = {
    // true 代表使用 midway logger
    // false 或者为空代表使用 egg-logger
    replaceEggLogger: true,
  };

  config.security = {
    csrf: {
      enable: false,
    },
  };

  config.task = {
    prefix: 'midway-task', // 这些任务存储的key，都是midway-task开头，以便区分用户原有redis里面的配置。
    defaultJobOptions: {
      repeat: {
        tz: 'Asia/Shanghai', // Task等参数里面设置的比如（0 0 0 * * *）本来是为了0点执行，但是由于时区不对，所以国内用户时区设置一下。
      },
    },
  };

  config.sequelize = {
    options: {
      encrypt: false,
      dialect: 'mysql',
      define: {
        timestamps: false, // 是否需要增加createdAt、updatedAt、deletedAt字段
        paranoid: false, // 此种模式下，删除数据时不会进行物理删除，而是设置deletedAt为当前时间
        // createdAt: 'created_at', //字段重命名
        // updatedAt: 'updated_at',
        // deletedAt: 'deleted_at',
        underscored: false, // 不给所有属性设置下划线
        freezeTableName: true, //不会尝试更改模型名以获取表名。否则，型号名称将是复数
        engine: 'innodb', // 默认的存储引擎
      },
      timezone: '+08:00',
      benchmark: true,
      logging: (sql, timing) => {
        // 每次日志输出都会调用的函数，可以在此进行重写
        if (typeof timing === 'number' && timing > 5000) {
          // 记录执行时间超过阈值的sql
          console.warn(`[sequelize](${timing} ms) ${sql}`);
        }
      },
      poll: {
        max: 10,
        min: 5,
        acquire: 60000,
        idle: 30000,
      },
      dialectOptions: {
        // 此处配置将直接传给数据库
        connectTimeout: 30000, // 单次查询连接超时时间
        dateStrings: true, // 不会返回UTC格式时间
        typeCast: true, // 驼峰命名
        bigNumberStrings: true, // bigInt和decimal 以字符串返回
      },
    },
    sync: false, // 本地的时候，可以通过sync: true直接createTable
  };

  config.egg = {
    contextLoggerFormat: info => {
      const ctx = info.ctx;
      return `${info.timestamp} ${info.LEVEL} ${info.pid} [${ctx.reqId} ${
        ctx.userId
      } - ${Date.now() - ctx.startTime}ms ${ctx.method} ${ctx.url}] ${
        info.message
      }`;
    },
    port: 6001,
  };

  return config;
};
