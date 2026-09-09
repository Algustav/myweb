CMS.registerEventListener({
  name: 'preSave',
  handler: ({ entry }) => {
    if (entry.get('collection') !== 'labs') return;
    const data = entry.get('data');
    const address = String(data.get('projectUrl') || '').trim();
    const body = String(data.get('body') || '').trim();
    if (!address && !body) throw new Error('请填写体验地址或正文说明，至少填写一项。');
    if (address && !/^(\/(?!\/)|https?:\/\/)[^\s\\]+$/i.test(address)) {
      throw new Error('体验地址须为站内路径（如 /7habits/）或完整的 http(s) 网址。');
    }
    const cover = String(data.get('cover') || '').trim().replace(/^\/?public\/uploads\//, '/uploads/').replace(/^uploads\//, '/uploads/');
    return data.set('cover', cover).set('projectUrl', address).set('order', Number(data.get('order') || 0));
  }
});
