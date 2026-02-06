const Footer = () => {
  const year = new Date().getFullYear();

  // TODO: 替换成你的真实信息
  const siteName = '心语疗愈';
  const icpText = 'ICP备案号：待补充';
  const icpHref = 'https://beian.miit.gov.cn/';

  const infoLinks = [
    { label: '关于我们', href: '#about' },
    { label: '用户协议', href: '#terms' },
    { label: '隐私政策', href: '#privacy' },
  ];

  const contactItems = [
    { label: '邮箱', value: 'contact@example.com' },
    { label: '微信', value: 'WeChat_ID' },
  ];

  const promoItems = [
    { label: '小红书', value: '@你的宣传号' },
    { label: '公众号', value: '你的公众号名称' },
  ];

  return (
    <footer className="relative z-10 mt-10 pb-32">
      <div className="max-w-5xl mx-auto px-4">
        <div className="glass-card px-5 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <h3 className="text-[13px] font-semibold text-neutral-800">信息区</h3>
              <ul className="mt-3 space-y-2">
                {infoLinks.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-[13px] text-neutral-500 hover:text-neutral-800 transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[13px] font-semibold text-neutral-800">联系方式</h3>
              <ul className="mt-3 space-y-2">
                {contactItems.map((item) => (
                  <li key={item.label} className="text-[13px] text-neutral-500">
                    <span className="text-neutral-400">{item.label}：</span>
                    <span className="select-text">{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[13px] font-semibold text-neutral-800">宣传号</h3>
              <ul className="mt-3 space-y-2">
                {promoItems.map((item) => (
                  <li key={item.label} className="text-[13px] text-neutral-500">
                    <span className="text-neutral-400">{item.label}：</span>
                    <span className="select-text">{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-black/[0.05] flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[12px] text-neutral-400">
              © {year} {siteName}. All rights reserved.
            </div>

            <a
              href={icpHref}
              target="_blank"
              rel="noreferrer"
              className="text-[12px] text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              {icpText}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
