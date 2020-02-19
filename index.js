const Scrapper = require('./Scrapper');

const scrapper = new Scrapper();

(async () => {
  //await scrapper.getAllLinks('https://www.drive2.ru/experience/mitsubishi/g5051?from=0');

  //await scrapper.getAllLinks('https://www.drive2.ru/experience/mitsubishi/g5051?from=132228971463252630');
  /*
  while(scrapper.prev !== ''){
    await scrapper.getAllLinks(scrapper.prev);
  }
  */

  //const url = 'https://www.drive2.ru/l/514223447442719862/';

  const doWork = (startPost, startTopic) => {
    let topic = startTopic;
    let post = startPost;
    let links = scrapper.links;
    let startFrom = 1928;
    return async () => {
      let text = await scrapper.getPostText(links[startFrom]);
      if(text) await scrapper.createNewTopic(topic, 96, text.title, post, 'Какие-то теги', `Автор: ${text.author}\n${text.text}\n<a href="${links[startFrom]}">Источник</a>`);
      topic = topic + 1;
      post = post + 1;
      startFrom = startFrom + 1;
      await console.log(`topic: ${topic}, post: ${post}, startFrom: ${startFrom}`);
    }
  }
  let abc = await doWork(5403, 4960);

  for(let i = 0; i < 600;i++) {
    await abc();
  }

})();
