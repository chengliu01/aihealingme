import { Instagram, Facebook, MessageCircle, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();

  // TODO: 替换成你的真实信息
  const siteName = '心语疗愈';
  const icpText = 'ICP备案号：待补充';
  const icpHref = 'https://beian.miit.gov.cn/';

  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: MessageCircle, href: '#', label: 'WeChat' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Youtube, href: '#', label: 'Youtube' },
  ];

  return (
    <footer className="relative z-10 mt-auto pb-32 bg-[#E5E0DA]">
      <div className="max-w-7xl mx-auto px-0.5 sm:px-2 md:px-3 py-12">
        {/* 顶部区域：品牌 + 社交媒体 | 联系信息 */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-10">
          {/* 左侧：品牌名 + 社交媒体 */}
          <div>
            <h2 className="text-3xl font-medium text-neutral-700 mb-4">{siteName}</h2>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-9 h-9 rounded-full border border-neutral-400/40 flex items-center justify-center text-neutral-500 hover:text-neutral-700 hover:border-neutral-500 transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon size={16} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* 右侧：联系信息 */}
          <div className="md:text-right">
            <h3 className="text-xs font-medium text-neutral-600 uppercase tracking-wider mb-3">联系我们</h3>
            <div className="space-y-1.5 text-sm text-neutral-600">
              <p>加入我们</p>
              <p>contact@example.com</p>
              <p>support@xinyuliao.com</p>
            </div>
          </div>
        </div>

        {/* 分隔线 */}
        <div className="h-px bg-neutral-400/20 mb-8" />

        {/* 中部：免责声明 */}
        <div className="mb-8">
          <h3 className="text-xs font-medium text-neutral-700 uppercase tracking-wider mb-3">免责声明</h3>
          <p className="text-sm text-neutral-600 leading-relaxed max-w-3xl">
            心语疗愈并非设计用于危机干预。如果您正处于危机中，请寻求专业帮助或拨打危机热线。
            您可以在 www.findahelpline.com 找到相关资源。
          </p>
        </div>

        {/* 分隔线 */}
        <div className="h-px bg-neutral-400/20 mb-6" />

        {/* 底部：版权信息 + 法律链接 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-xs text-neutral-500">
            © {year} {siteName}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
            <a
              href={icpHref}
              target="_blank"
              rel="noreferrer"
              className="hover:text-neutral-700 transition-colors duration-200"
            >
              {icpText}
            </a>
            <a href="#terms" className="hover:text-neutral-700 transition-colors duration-200">
              用户协议
            </a>
            <a href="#privacy" className="hover:text-neutral-700 transition-colors duration-200">
              隐私政策
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
