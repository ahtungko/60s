export const config = {
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT ? +process.env.PORT : 4399,
  group: '595941841',
  author: 'Viki <hi@viki.moe>',
  github: 'https://github.com/vikiboss/60s',
  encodingParamName: process.env.ENCODING_PARAM_NAME || 'encoding',
}

export const COMMON_MSG = `All data originates from official sources, ensuring real-time accuracy and system stability.`
