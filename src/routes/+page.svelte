<h1>This is an example with infinity scroll navigation.</h1>

<h2><a href="/V59OF92YF627HFY0">Visit demo</a></h2>

<h1>Infinity Scroll Navigation</h1>

<p>
  This is a basic example of infinite navigation with automatic loading of the
  next page.
</p>

<h2>How It Works</h2>

<ul>
  <li>The user lands on a publication page.</li>
  <li>Several publications are preloaded immediately.</li>
  <li>As the user reads, the next publications are automatically loaded.</li>
  <li>
    The browser’s address bar always shows the URL of the publication currently
    in view.
  </li>
</ul>

<blockquote>
  <p>
    This approach can be useful for news articles or blog posts. When a visitor
    finishes reading one post, they seamlessly continue to the next without any
    noticeable page transition — the next page is loaded immediately after the
    current one.
  </p>
</blockquote>

<h2>Challenges to Address</h2>

<p>
  In this behavior pattern, it’s important to handle a few details carefully:
</p>

<ul>
  <li>
    Preload multiple publications so that the user doesn’t have to wait for the
    next one after finishing the current.
  </li>
  <li>
    Update the URL based on the currently visible publication. This allows users
    to return to the exact post they were reading.
  </li>
  <li>
    Preserve scroll position. Browsers typically save the scroll position and
    restore it after a reload or when navigating back. But when the URL and page
    height change dynamically, this becomes tricky — we’ll solve that.
  </li>
  <li>
    Remove pages that are no longer in view: to avoid overloading the viewport,
    we’ll periodically clean up content the user has already scrolled past.
  </li>
  <li>Maintain scroll position even when DOM elements are updated.</li>
</ul>

<h2>Logic Behind the Implementation</h2>

<ul>
  <li>
    When we receive the target page URL, we’ll fetch it from the database along
    with the next 10 publications (in this example, pages are sorted by
    publication order).
  </li>
  <li>
    We won’t create a separate API for loading publications — we’ll use the <code
      >load</code
    > function instead.
  </li>
  <li>
    On the initial request, we return 10 publications. For subsequent loads, we
    only return one additional post and avoid sending data already present on
    the client.
  </li>
  <li>
    On the client, publications are stored in a separate store, independent from
    the <code>data</code> store, to prevent new data from breaking the page state.
  </li>
  <li>
    We’ll load new data on the client using <code>goto()</code>. This helps us
    both change the URL and process new data in one step.
  </li>
  <li>
    We’ll trigger the transition as soon as the next publication comes into view
    at the top of the screen. This way, we always have 10 posts preloaded ahead.
  </li>
  <li>
    After fetching new data, we add it to the store and update the viewport
    accordingly.
  </li>
  <li>
    Finally, we’ll apply a couple of tricks to ensure the browser properly
    restores the scroll position.
  </li>
</ul>
