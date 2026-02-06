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
    <footer className="relative z-10 mt-auto pb-32">
      <div className="max-w-5xl mx-auto px-4">
        {/* 完全透明容器 */}
        <div className="relative px-6 py-8">
          {/* 微妙的背景光晕 */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-violet-100/20 to-purple-100/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-cyan-100/20 to-blue-100/20 rounded-full blur-3xl" />
          
          <div className="relative">
            {/* 内容区域 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-6">
              <div>
                <h3 className="text-[13px] font-semibold text-neutral-600 mb-3">信息区</h3>
                <ul className="space-y-2.5">
                  {infoLinks.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        className="text-[13px] text-neutral-500 hover:text-neutral-800 transition-colors duration-200 inline-block"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-[13px] font-semibold text-neutral-600 mb-3">联系方式</h3>
                <ul className="space-y-2.5">
                  {contactItems.map((item) => (
                    <li key={item.label} className="text-[13px] text-neutral-500">
                      <span className="text-neutral-400">{item.label}：</span>
                      <span className="select-text">{item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-[13px] font-semibold text-neutral-600 mb-3">宣传号</h3>
                <ul className="space-y-2.5">
                  {promoItems.map((item) => (
                    <li key={item.label} className="text-[13px] text-neutral-500">
                      <span className="text-neutral-400">{item.label}：</span>
                      <span className="select-text">{item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 分割线 - 更淡 */}
            <div className="h-px bg-gradient-to-r from-transparent via-neutral-300/30 to-transparent mb-6" />

            {/* 底部版权信息 */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-[12px] text-neutral-400">
                © {year} {siteName}. All rights reserved.
              </div>

              <a
                href={icpHref}
                target="_blank"
                rel="noreferrer"
                className="text-[12px] text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
              >
                {icpText}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
