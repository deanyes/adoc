import https from 'https';
import fs from 'fs';
import path from 'path';

export interface FeishuConfig {
  appId: string;
  appSecret: string;
  spaceId?: string;
}

export interface WikiNode {
  node_token: string;
  obj_token: string;
  obj_type: string;
  title: string;
  parent_node_token?: string;
  children?: WikiNode[];
}

export class FeishuClient {
  private appId: string;
  private appSecret: string;
  private accessToken: string = '';
  
  constructor(config: FeishuConfig) {
    this.appId = config.appId;
    this.appSecret = config.appSecret;
  }
  
  async init(): Promise<void> {
    const resp = await this.request('POST', '/auth/v3/tenant_access_token/internal', {
      app_id: this.appId,
      app_secret: this.appSecret
    });
    this.accessToken = resp.tenant_access_token;
    console.log('✅ Feishu auth successful');
  }
  
  async getSpaceNodes(spaceId: string): Promise<WikiNode[]> {
    const allNodes: WikiNode[] = [];
    let pageToken = '';
    
    do {
      const url = `/wiki/v2/spaces/${spaceId}/nodes?page_size=50${pageToken ? `&page_token=${pageToken}` : ''}`;
      const resp = await this.request('GET', url);
      
      if (resp.items) {
        allNodes.push(...resp.items);
      }
      pageToken = resp.page_token || '';
    } while (pageToken);
    
    return allNodes;
  }
  
  async getDocumentContent(docToken: string): Promise<string> {
    const blocks = await this.getDocumentBlocks(docToken);
    return this.blocksToMarkdown(blocks, docToken);
  }
  
  async getDocumentBlocks(docToken: string): Promise<any[]> {
    const blocks: any[] = [];
    let pageToken = '';
    
    do {
      const url = `/docx/v1/documents/${docToken}/blocks?page_size=500${pageToken ? `&page_token=${pageToken}` : ''}`;
      const resp = await this.request('GET', url);
      
      if (resp.items) {
        blocks.push(...resp.items);
      }
      pageToken = resp.page_token || '';
    } while (pageToken);
    
    return blocks;
  }
  
  async downloadImage(token: string, outputPath: string): Promise<boolean> {
    return new Promise((resolve) => {
      const options = {
        hostname: 'open.feishu.cn',
        path: `/open-apis/drive/v1/medias/${token}/download`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      };
      
      const req = https.request(options, (res) => {
        if (res.statusCode === 302 || res.statusCode === 301) {
          // 处理重定向
          const redirectUrl = res.headers.location;
          if (redirectUrl) {
            https.get(redirectUrl, (redirectRes) => {
              const chunks: Buffer[] = [];
              redirectRes.on('data', (chunk) => chunks.push(chunk));
              redirectRes.on('end', () => {
                const buffer = Buffer.concat(chunks);
                if (buffer.length > 1000) { // 大于1KB才是有效图片
                  fs.writeFileSync(outputPath, buffer);
                  resolve(true);
                } else {
                  resolve(false);
                }
              });
            }).on('error', () => resolve(false));
          } else {
            resolve(false);
          }
        } else {
          const chunks: Buffer[] = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => {
            const buffer = Buffer.concat(chunks);
            if (buffer.length > 1000) {
              fs.writeFileSync(outputPath, buffer);
              resolve(true);
            } else {
              resolve(false);
            }
          });
        }
      });
      
      req.on('error', () => resolve(false));
      req.end();
    });
  }
  
  private blocksToMarkdown(blocks: any[], docToken: string): string {
    const lines: string[] = [];
    const imageTokens: string[] = [];
    
    for (const block of blocks) {
      const type = block.block_type;
      
      switch (type) {
        case 2: // Text/Paragraph
          if (block.text) {
            lines.push(this.textElementsToMd(block.text.elements));
            lines.push('');
          }
          break;
          
        case 3: // Heading 1
          if (block.heading1) {
            lines.push(`# ${this.textElementsToMd(block.heading1.elements)}`);
            lines.push('');
          }
          break;
          
        case 4: // Heading 2
          if (block.heading2) {
            lines.push(`## ${this.textElementsToMd(block.heading2.elements)}`);
            lines.push('');
          }
          break;
          
        case 5: // Heading 3
          if (block.heading3) {
            lines.push(`### ${this.textElementsToMd(block.heading3.elements)}`);
            lines.push('');
          }
          break;
          
        case 6: // Heading 4
          if (block.heading4) {
            lines.push(`#### ${this.textElementsToMd(block.heading4.elements)}`);
            lines.push('');
          }
          break;
          
        case 12: // Bullet list
          if (block.bullet) {
            lines.push(`- ${this.textElementsToMd(block.bullet.elements)}`);
          }
          break;
          
        case 13: // Ordered list
          if (block.ordered) {
            lines.push(`1. ${this.textElementsToMd(block.ordered.elements)}`);
          }
          break;
          
        case 14: // Code block
          if (block.code) {
            const lang = block.code.style?.language || '';
            lines.push('```' + lang);
            lines.push(this.textElementsToMd(block.code.elements));
            lines.push('```');
            lines.push('');
          }
          break;
          
        case 27: // Image
          if (block.image?.token) {
            const token = block.image.token;
            imageTokens.push(token);
            lines.push(`![](/images/${token}.png)`);
            lines.push('');
          }
          break;
          
        case 18: // Callout
          if (block.callout) {
            lines.push('::: tip');
            lines.push(this.textElementsToMd(block.callout.elements || []));
            lines.push(':::');
            lines.push('');
          }
          break;
          
        case 20: // Divider
          lines.push('---');
          lines.push('');
          break;
      }
    }
    
    // 存储图片token供后续下载
    (this as any)._lastImageTokens = imageTokens;
    
    return lines.join('\n');
  }
  
  getLastImageTokens(): string[] {
    return (this as any)._lastImageTokens || [];
  }
  
  private textElementsToMd(elements: any[]): string {
    if (!elements) return '';
    
    return elements.map(el => {
      if (el.text_run) {
        let text = el.text_run.content || '';
        const style = el.text_run.text_element_style || {};
        
        if (style.bold) text = `**${text}**`;
        if (style.italic) text = `*${text}*`;
        if (style.strikethrough) text = `~~${text}~~`;
        if (style.inline_code) text = `\`${text}\``;
        if (style.link?.url) text = `[${text}](${style.link.url})`;
        
        return text;
      }
      return '';
    }).join('');
  }
  
  private async request(method: string, path: string, body?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'open.feishu.cn',
        path: `/open-apis${path}`,
        method,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...(this.accessToken ? { 'Authorization': `Bearer ${this.accessToken}` } : {})
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.code !== 0) {
              reject(new Error(`Feishu API error ${json.code}: ${json.msg}`));
            } else {
              resolve(json.data || {});
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${data.slice(0, 200)}`));
          }
        });
      });
      
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }
}

// 辅助函数：延迟
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
