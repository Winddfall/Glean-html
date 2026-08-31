/* eslint-disable @next/next/no-img-element */
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { withBasePath } from "@/lib/base-path";

const components: Components = {
  img: ({ src, alt, ...rest }) => {
    const isStorageIllustration = src === "/images/product/storage.png";

    const imageSrc = typeof src === "string" ? withBasePath(src) : src;

    return (
      <img
        src={imageSrc}
        alt={alt ?? ""}
        {...rest}
        {...(isStorageIllustration
          ? { width: 529, height: 585, className: "storage-guide-image" }
          : {})}
      />
    );
  },
  a: ({ href, children, ...rest }) => {
    // Rewrite local ./xxx.md links to /guide/xxx
    if (href && /\.md$/i.test(href.split("#")[0])) {
      const base = href.replace(/^\.\/(.*)\.md$/, "$1").replace(/\.md$/, "");
      return (
        <Link href={`/guide/${base}`} {...rest}>
          {children}
        </Link>
      );
    }
    const isExternal = href && /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  },
};

export function Markdown({ source }: { source: string }) {
  return (
    <div className="mdx">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
