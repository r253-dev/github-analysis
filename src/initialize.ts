export function initialize() {
  if (process.env.GH_TOKEN === undefined) {
    throw new Error('環境変数 GH_TOKEN を指定してください。');
  }
}
