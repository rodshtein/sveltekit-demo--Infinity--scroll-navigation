# Infinity Scroll Navigation

[🇷🇺 На русском](#бесконечная-скролл-навигация)

This is a basic example of infinite navigation with automatic loading of the next page.

## ⚠️ Unresolved Issues

- Back navigation in Safari: when returning to the previous page, the scroll position is incorrect.

## How It Works

- The user lands on a publication page.
- Several publications are preloaded immediately.
- As the user reads, the next publications are automatically loaded.
- The browser’s address bar always shows the URL of the publication currently in view.

> This approach can be useful for news articles or blog posts. When a visitor finishes reading one post, they seamlessly continue to the next without any noticeable page transition — the next page is loaded immediately after the current one.

## Challenges to Address

In this behavior pattern, it’s important to handle a few details carefully:

- Preload multiple publications so that the user doesn’t have to wait for the next one after finishing the current.
- Update the URL based on the currently visible publication. This allows users to return to the exact post they were reading.
- Preserve scroll position. Browsers typically save the scroll position and restore it after a reload or when navigating back. But when the URL and page height change dynamically, this becomes tricky — we’ll solve that.
- Remove pages that are no longer in view: to avoid overloading the viewport, we’ll periodically clean up content the user has already scrolled past.
- Maintain scroll position even when DOM elements are updated.

## Logic Behind the Implementation

- When we receive the target page URL, we’ll fetch it from the database along with the next 10 publications (in this example, pages are sorted by publication order).
- We won’t create a separate API for loading publications — we’ll use the `load` function instead.
- On the initial request, we return 10 publications. For subsequent loads, we only return one additional post and avoid sending data already present on the client.
- On the client, publications are stored in a separate store, independent from the `data` store, to prevent new data from breaking the page state.
- We’ll load new data on the client using `goto()`. This helps us both change the URL and process new data in one step.
- We’ll trigger the transition as soon as the next publication comes into view at the top of the screen. This way, we always have 10 posts preloaded ahead.
- After fetching new data, we add it to the store and update the viewport accordingly.
- Finally, we’ll apply a couple of tricks to ensure the browser properly restores the scroll position.

# Бесконечная скролл-навигация

Это базовый пример бесконечной навигации с автоматической подгрузкой следующей страницы.

## ⚠️ Не решенные проблемы

- Навигация Назад в Safari: при возврате обратно страница скроллится на неправильную позицию.

## Как это работает

- Пользователь попадает на страницу публикации.
- На странице сразу загружается несколько публикаций.
- В процессе чтения автоматически подгружаются следующие публикации.
- В адресной строке всегда отображается URL публикации, находящейся в зоне видимости.

> Такой подход может быть полезен для новостей или блога. Когда посетитель дочитывает одну публикацию, он сразу попадает на следующую — бесшовно, без явного перехода. Новая страница просто подгружается сразу после текущей.

## Какие задачи нужно решить

При реализации такого поведения важно учесть несколько нюансов:

- **Заранее загружать несколько публикаций**, чтобы пользователь, дочитав текущую, не ждал, пока загрузится следующая.
- **Обновлять адрес страницы** в соответствии с просматриваемой публикацией. Это позволит сохранить конкретную публикацию при возврате на страницу.
- **Сохранять позицию прокрутки**.  
  Браузеры по умолчанию запоминают положение прокрутки и возвращают пользователя в ту же точку после перезагрузки или возврата.  
  Но при динамической смене URL и высоты страницы всё становится сложнее — эту задачу мы тоже решим.
- **Очищать просмотренные страницы**.  
  Чтобы не перегружать вьюпорт, мы будем периодически удалять контент, который пользователь уже просмотрел.
- **Сохранять позицию прокрутки при изменении DOM-элементов**.

## Логика работы

1. Получив целевой URL, мы загружаем соответствующую публикацию из базы данных, а также 10 следующих (в этом примере публикации идут по порядку).
2. Отдельный API для подгрузки не нужен — используем функцию `load`.
3. При первом запросе отдаем 10 публикаций, при последующих — только одну новую, не отправляя уже загруженные данные.
4. На клиенте публикации хранятся в отдельном сторе, независимом от `data`, чтобы новые данные не нарушали состояние страницы.
5. Подгрузка выполняется через переход `goto()`.  
   Это позволяет одновременно обновить URL и получить новые данные.
6. Переход запускается, когда следующая публикация оказывается в верхней части экрана.  
   Таким образом, у нас всегда есть 10 публикаций «в запасе» вниз по ленте.
7. После получения новых данных — добавляем их в хранилище и обновляем отображение.
8. В завершение применяем пару трюков, чтобы браузер корректно восстанавливал позицию прокрутки.
