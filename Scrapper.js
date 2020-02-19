const puppeteer = require('puppeteer');
const fs = require('fs');

class Scrapper {
  constructor() {
    this.links = [];
    this.topicPoster = 316; // id пользователя DriveBot
    this.prev = false;
    this.readLinks();
  }

  readLinks() {
    let tempJSONlinks = JSON.parse(fs.readFileSync('links.db', 'utf8'));
    this.links = tempJSONlinks;
  }

  sortLinks() {
    let arr = this.links;
    const sortArr = arr.filter((it, index) => index === arr.indexOf(it = it.trim()));
    fs.writeFileSync('links.db', JSON.stringify(sortArr, null, '\t'));
  }

  async getPostText(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    let result = await page.evaluate(() => {
      let post = document.querySelector('div.c-link-decorated');
      let title = document.querySelector('body > div.l-body > main > div > div.l-page.js-page > div > div.g-full-size-post.c-post > h1 > span.u-break-word');
      let author = document.querySelector('body > div.l-body > main > div > div.l-page.js-page > div > div.g-full-size-post.c-post > div.c-block.c-block--wide.c-block--content > div.c-post__user-info > div > div > div.c-user-card__username > a > span');
      if(title === null || author === null) {
        return false;
      } else {
        title = title.textContent;
        author = author.textContent;
      }
      let nodes = Array.from(post.childNodes);
      let result = '';
      for(let i = 0; i < nodes.length; i++) {
        let node = nodes[i];
        let type = node.nodeName;
        if(type === 'P' && node.innerText !== '') result = result + node.innerText.replace("'") + '\n';
        if(type === 'DIV' && node.className === 'c-post__pic') result = result + `
          <IMG src="${node.getElementsByTagName('img')[1].getAttribute('src')}"><s>[img]</s><URL url="${node.getElementsByTagName('img')[1].getAttribute('src')}">${node.getElementsByTagName('img')[1].getAttribute('src')}</URL><e>[/img]</e></IMG>
        `;
      }

      return {
        text: result,
        title: title,
        author: author,
        //source: `<a href='${url}'>Источник</a>`
      };
    });

    await browser.close();
    return result;
  }

  async getAllLinks(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    let result = await page.evaluate(() => {
      let links = document.querySelectorAll('div.c-post-preview__title > a.c-link.c-link--text');
      let nodes = Array.from(links);
      let tempLinks = [];
      for(let i = 0; i < nodes.length; i++) {
        let node = nodes[i];
        let href = node.getAttribute('href');
        tempLinks.push(`https://www.drive2.ru${href}`);
      }

      let prevSomewhereHere = Array.from(document.querySelectorAll('.c-pager__link'));
      let prevElement = prevSomewhereHere.find((element, index, array) => {
        return element.getAttribute('rel') === 'prev';
      });

      let prev = '';
      if (prevElement !== undefined) prev = `https://www.drive2.ru${prevElement.getAttribute('href')}`;
      return { links: tempLinks, "prev": prev };
    });


    this.links = this.links.concat(result.links);
    fs.appendFileSync('links.db', JSON.stringify(this.links, null, '\t'));
    this.prev = result.prev;
    console.log(result);
    await browser.close();
  }

  createNewTopic(topic_id, forum_id, topicTitle, postId, seoTags, postText) {
    const topicHeader = 'INSERT INTO `phpbb_topics` (`topic_id`, `forum_id`, `topic_title`, `topic_poster`, `topic_time`, `topic_first_post_id`, `topic_first_poster_name`, `topic_first_poster_colour`, `topic_last_post_id`, `topic_last_poster_id`, `topic_last_poster_name`, `topic_last_poster_colour`, `topic_last_post_subject`, `topic_last_post_time`, `topic_last_view_time`, `poll_title`, `topic_delete_reason`, `seo_topicdesc`, `topic_visibility`, `topic_posts_approved`) VALUES';
    const topicBody = `(${topic_id}, ${forum_id}, '${topicTitle}', ${this.topicPoster}, 1544888598, ${postId}, 'DriveBot', 'AA0000', ${postId}, ${this.topicPoster}, 'DriveBot', '', '${topicTitle}', 1545128651, 1581641522, '', '', '${seoTags}', '1', '1');\n`;

    const postHeader = 'INSERT INTO `phpbb_posts` (`post_id`,`topic_id`, `forum_id`, `poster_id`, `poster_ip`, `post_time`, `post_username`, `post_subject`, `post_text`, `post_checksum`, `bbcode_bitfield`, `bbcode_uid`, `post_postcount`, `post_edit_reason`, `post_visibility`, `post_delete_reason`) VALUES ';
    const postBody = `(${postId}, ${topic_id}, ${forum_id}, ${this.topicPoster}, '127.0.0.1', 1544888598, '', '${topicTitle}', '${postText}', '6dd075556effaa6e7f1e3e3ba9fdc5fa', '', 'j', 1, '', 1, '');\n`;

    fs.appendFileSync('posts.sql', topicHeader + topicBody + postHeader + postBody);
    return topicHeader + topicBody + postHeader + postBody;
  }
}

module.exports = Scrapper;
