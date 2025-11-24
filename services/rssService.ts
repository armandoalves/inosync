// --- Types based on tutorial ---

export interface InoreaderItem {
  id: string;
  title: string;
  summary: {
    content: string;
  };
  published?: number;
  origin?: {
    title: string;
  };
  link?: {
    href: string;
  };
}

export interface NoteGenerationResult {
  generatedTitle: string;
  markdownContent: string;
}

// Simple interface for a fetch-like function
type RequestFunction = (url: string) => Promise<any>;

// --- Service Functions ---

/**
 * Constructs the Inoreader Public Feed URL.
 * Defaults to fetching up to 200 items (Inoreader default is often 20).
 */
export function getInoreaderFeedUrl(userId: string, tag: string): string {
    return `https://www.inoreader.com/stream/user/${userId}/tag/${encodeURIComponent(tag)}?n=200`;
}

/**
 * Simulates fetching data from Inoreader public feeds.
 * No token is required for public streams.
 * 
 * @param tag The tag to fetch
 * @param userId The Inoreader User ID
 * @param force Force refresh
 * @param customFetcher Optional function to handle the request (e.g. Obsidian requestUrl)
 */
export async function fetchInoreaderFeed(
    tag: string, 
    userId: string, 
    force: boolean = false,
    customFetcher?: RequestFunction
): Promise<InoreaderItem[]> {
  if (!userId) throw new Error("User ID is required to fetch feeds.");
  
  let url = getInoreaderFeedUrl(userId, tag);
  
  // Add timestamp to bypass caching if force sync is requested
  if (force) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}t=${Date.now()}`;
  }
  
  let text = '';

  try {
      if (customFetcher) {
          // Real implementation for Obsidian Plugin
          const response = await customFetcher(url);
          // Obsidian requestUrl returns an object with a 'text' property containing the body
          text = response.text !== undefined ? response.text : response;
          
          if (response.status && response.status >= 400) {
              throw new Error(`HTTP Error ${response.status}`);
          }
      } else {
          // Simulator Mode: Try fetching via CORS Proxy first to see real data
          try {
              const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
              const response = await fetch(proxyUrl);
              if (!response.ok) throw new Error('Proxy error');
              text = await response.text();
          } catch (e) {
             // Fallback to Mocks logic below
             await new Promise(resolve => setTimeout(resolve, 800));
             return getMockItems(tag, userId);
          }
      }

      // --- Parsing Logic ---

      // Validation: Check if we got HTML (e.g. Cloudflare challenge, 403 Forbidden page) instead of XML
      if (text.trim().startsWith('<!DOCTYPE html') || text.includes('<html')) {
          throw new Error("Received HTML instead of XML. The request might be blocked by Inoreader (Cloudflare/Bot Protection). Check User-Agent settings.");
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "text/xml");
      
      // Check for XML parse errors
      const parseError = xmlDoc.querySelector("parsererror");
      if (parseError) {
           throw new Error("Failed to parse XML feed. The feed might be malformed.");
      }

      // Support both Atom (<entry>) and RSS (<item>)
      let entries = Array.from(xmlDoc.getElementsByTagName("entry"));
      
      if (entries.length === 0) {
          entries = Array.from(xmlDoc.getElementsByTagName("item"));
      }
      
      return entries.map(entry => {
          // Helper to get text content from direct children safely
          const getTagText = (tagName: string) => {
              const el = entry.getElementsByTagName(tagName)[0];
              return el ? el.textContent : null;
          };

          const title = getTagText("title") || "Untitled";
          
          // ID: Atom uses <id>, RSS uses <guid>. Fallback to link if neither exists.
          let id = getTagText("id") || getTagText("guid");
          
          // Content: Atom <content>, <summary>. RSS <description>, <content:encoded>.
          let content = "";
          const contentEl = entry.getElementsByTagName("content")[0];
          const summaryEl = entry.getElementsByTagName("summary")[0];
          const descriptionEl = entry.getElementsByTagName("description")[0];
          
          // For content:encoded, it's tricky with namespaced tags in getElementsByTagName.
          // Some browsers support "content:encoded", some "encoded".
          const encodedEl = entry.getElementsByTagName("content:encoded")[0] || entry.getElementsByTagName("encoded")[0];
          
          if (contentEl && contentEl.textContent) content = contentEl.textContent;
          else if (encodedEl && encodedEl.textContent) content = encodedEl.textContent;
          else if (descriptionEl && descriptionEl.textContent) content = descriptionEl.textContent;
          else if (summaryEl && summaryEl.textContent) content = summaryEl.textContent;
          
          // Date
          const publishedText = getTagText("published") || getTagText("updated") || getTagText("pubDate") || getTagText("dc:date");
          const published = publishedText ? new Date(publishedText).getTime() / 1000 : Date.now() / 1000;
          
          // Source
          let sourceTitle = "Inoreader";
          const sourceEl = entry.getElementsByTagName("source")[0];
          if (sourceEl) {
              // Atom <source><title>...</title></source> or RSS <source url="...">Title</source>
              const subTitle = sourceEl.getElementsByTagName("title")[0];
              sourceTitle = subTitle?.textContent || sourceEl.textContent || "Inoreader";
          }
          
          // Link
          let href = "";
          const links = Array.from(entry.getElementsByTagName("link"));
          
          if (links.length > 0) {
              // Atom style: <link rel="alternate" href="..." />
              const atomLink = links.find(l => l.getAttribute("rel") === "alternate" && l.getAttribute("href"));
              if (atomLink) {
                  href = atomLink.getAttribute("href") || "";
              } 
              // RSS style: <link>http...</link> (text content)
              else if (links[0].textContent && links[0].textContent.trim().startsWith("http")) {
                   href = links[0].textContent.trim();
              }
              // Fallback: any href attribute
              else if (links[0].getAttribute("href")) {
                  href = links[0].getAttribute("href") || "";
              }
          }

          // Fallback ID if still missing
          if (!id) id = href;
          
          return {
              id,
              title,
              summary: { content },
              published,
              origin: { title: sourceTitle },
              link: { href }
          };
      });
  } catch (error) {
      throw error;
  }
}

function getMockItems(tag: string, userId: string): InoreaderItem[] {
  return [
    {
      id: `tag:inoreader.com,2024:item/${tag}_1`,
      title: `${tag}: The Comprehensive Guide`,
      summary: {
        content: `This is a simulated article content retrieved for the tag <b>${tag}</b> from user <b>${userId}</b>.`
      },
      origin: { title: "Inoreader Public Feed" },
      published: Date.now() / 1000,
      link: { href: "https://inoreader.com/example/1" }
    },
    {
      id: `tag:inoreader.com,2024:item/${tag}_2`,
      title: `Why ${tag} Matters in 2024`,
      summary: {
        content: "An analysis of current trends and future predictions based on public RSS data."
      },
      origin: { title: "Tech Weekly" },
      published: (Date.now() / 1000) - 86400,
      link: { href: "https://inoreader.com/example/2" }
    },
    {
      id: `tag:inoreader.com,2024:item/${tag}_3`,
      title: `10 Tips for ${tag}`,
      summary: {
        content: "A listicle format article with quick tips and tricks."
      },
      origin: { title: "Daily Digest" },
      published: (Date.now() / 1000) - 172800,
      link: { href: "https://inoreader.com/example/3" }
    }
  ];
}

/**
 * Generates the Obsidian note content with Frontmatter.
 */
export function generateObsidianNote(item: InoreaderItem): NoteGenerationResult {
  const sanitizedTitle = item.title.replace(/[\\/:*?"<>|]/g, '-');
  
  // Convert HTML summary to crude Markdown
  let content = item.summary.content || '';
  
  // Basic HTML cleanup and whitespace normalization
  content = content
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<a href="(.*?)">(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<img[^>]+>/gi, (imgTag) => {
        const srcMatch = imgTag.match(/src\s*=\s*["']([^"']+)["']/i);
        const altMatch = imgTag.match(/alt\s*=\s*["']([^"']+)["']/i);
        
        if (srcMatch) {
            const src = srcMatch[1];
            const alt = altMatch ? altMatch[1] : '';
            return `\n![${alt}](${src})\n`;
        }
        return '';
    })
    .replace(/<[^>]*>/g, '') // Strip remaining tags
    .replace(/\r\n/g, '\n') // Normalize CRLF
    .replace(/\n\s+\n/g, '\n\n') // Collapse lines containing only whitespace
    .replace(/\n{3,}/g, '\n\n') // Collapse 3+ newlines to 2
    .trim();

  const sourceUrl = item.link?.href || 'https://inoreader.com';

  // Quote the ID to prevent YAML parsing errors with colons (e.g. tag:inoreader.com...)
  const markdownContent = `---
id: "${item.id.replace(/"/g, '\\"')}"
title: "${item.title.replace(/"/g, '\\"')}"
date: ${new Date((item.published || 0) * 1000).toISOString()}
source: ${item.origin?.title || 'Unknown'}
tags: [inoreader, rss]
url: ${sourceUrl}
---

# ${item.title}

${content}

[View Original Source](${sourceUrl})
`;

  return { generatedTitle: sanitizedTitle, markdownContent };
}
