# drive-scrapper
## Описание проекта
Программа на node js, которая позволяет перетащить посты по определенной тематике с сайта drive2.ru в любой форум phpbb. Изначально создавался из-за необходимости массового переноса постов технического содержания по автомобилю Mitsubishi Pajero sport 3 на форум, который является свеого рода энциклопедией по данной модели. Для каждой записи указывается имя автора и ссылка на оригинальный пост.
## Установка
1. Клонировать репозиторий
2. Выполнить npm i
## Формирование списка постов
1. Раскомментировать метод getAllLinks в index.js
2. В качестве аргумента указать ссылку на последнюю страницу списка постов по модели. Например, https://www.drive2.ru/experience/mitsubishi/g5051?from=0
3. Запустить скрипт через node index.js
4. Скрипт собирает массив из ссылок, находит кнопку prev со ссылкой на предыдущую страницу, переходит на нее и собирает ссылки на ней, после чего находит на этой странице кнопку prev и так до тех пор, пока не дойдет до конца, либо пока не произойдет ошибка.
5. Если происходит ошибка, то нужно заново вызвать этот метод, изменив аргумент метода getAllLinks на последнюю удачную страницу. Взять ее можно из лога, который выводится в консоль
6. Ссылки собираются в массив links, который записывается в файл links.db. После окончания работы метода getAllLinks, необходимо вызвать метод sortLinks(), который отфильтрует массив, оставив в нем только уникальные ссылки на посты.
## Загрузка постов в форум
1. Для начала нужно создать на форуме пользователя, под которым будут загружаться посты. Его id вписать в переменную this.topicPoster класса Scrapper.
2. После этого нужно создать раздел на форуме, куда будут заливаться посты
3. В файле index.js id раздела указывается во втором аргументе при вызове функции createNewTopic. По умолчанию id раздела 96.
4. В переменной startFrom файла index.js указывается номер поста из массива links.db, с которого нужно начать загрузку
5. Первым аргументом стрелочной функции doWork указывается id последнего поста на форуме +1
6. Вторым аргументом стрелочной функции doWork указывается id последней темы на форуме +1
7. Количество итераций указывается в цикле for
8. Запуск скрипта осуществляется через node index.js
9. Результатом работы скрипта является sql запрос, который записывается в файл posts.sql и который нужно выполнить на БД форума
