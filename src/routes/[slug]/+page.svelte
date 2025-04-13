<script>
  import { goto, beforeNavigate } from "$app/navigation";
  import { page } from "$app/state";
  import { SvelteMap } from "svelte/reactivity";
  import { tick } from "svelte";

  let { data } = $props();

  // Temporary store for holding the data.
  let pages = new SvelteMap();
  // A few variables used for optimizations below.
  let ticking = false;
  let isUpdate = false;
  let currentPageId = data.pages[0].id;

  // Save data from `data` into the store.
  setData(data.pages);

  function setData(data) {
    data.forEach((item) => {
      if (!pages.has(item.id)) {
        pages.set(item.id, item);
      }
    });
  }

  // Link DOM nodes with their corresponding data in the store.
  // We’ll need this data later.
  function linkItemNode(node, id) {
    let data = pages.get(id);
    data.node = node;
    pages.set(id, data);
  }

  $effect(() => {
    // Scroll watcher is attached to the page; it will trigger a handler.
    window.addEventListener("scroll", handleScroll);

    // Safari-specific hack #1:
    // We need to clear DOM nodes before a hard page reload,
    // otherwise the browser might restore the wrong scroll position.
    window.onbeforeunload = function (event) {
      clear(true);
    };

    return () => {
      // Remove the watcher when navigating away from the page.
      window.removeEventListener("scroll", handleScroll);
    };
  });

  // Function triggered periodically on scroll.
  function handleScroll() {
    // Immediately remove read articles if there are more than 30.
    if (pages.size > 30) clear();

    // To avoid calling this too frequently, we throttle using RAF.
    if (!ticking) {
      window.requestAnimationFrame(() => {
        // Get the ID of the page currently in the viewport.
        const id = getPageInViewId();

        // If it's different from the current page ID, update the active page.
        if (currentPageId != id) {
          currentPageId = id;
          // The user has read the previous page, so we load one more.
          updateData(id);
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  // Load one more page.
  // We pass the current page ID, and the server calculates which page to return.
  async function updateData(id) {
    // Warn other functions that navigation is triggered due to data update.
    isUpdate = true;

    await goto(`/${id}`, {
      // Don’t replace the state so that the back button returns us to the infinite scroll list.
      replaceState: true,
      // Disable automatic scroll and preserve focus to avoid jumps.
      noScroll: true,
      keepFocus: true,
    });

    isUpdate = false;

    // Update the store with new data.
    setData(data.pages);
  }

  // Determine the page in the viewport.
  // Instead of using IntersectionObserver on each page and dealing with related issues,
  // we simply find the page just above the viewport and return the one immediately after — this is the one in view.
  function getPageInViewId() {
    let closest = -Infinity;
    const keys = Array.from(pages.keys());

    let target_key = keys[0];

    for (let i = 0; i < keys.length; i++) {
      const targetItem = pages.get(keys[i]);
      const { bottom } = targetItem.node.getBoundingClientRect();

      if (0 > bottom && bottom > closest) {
        closest = bottom;
        target_key = keys[i + 1];
      }
    }

    return target_key;
  }

  // To preserve scroll position when navigating back — clear offscreen pages.
  beforeNavigate(() => {
    clear();
  });

  // This is the trickiest part:
  // The function does two things:
  // - Removes elements above the viewport.
  // - Preserves or restores scroll position.
  async function clear(reload = false) {
    // Exit if this runs during data fetching.
    // If you uncomment this line, the read page will be removed immediately
    // since updateData is triggered right after reading.
    if (isUpdate) return;

    // Get current page's position in the viewport.
    let currentPage = pages.get(currentPageId);
    let rect = currentPage.node.getBoundingClientRect();
    // Round the values to detect if scroll was affected after removing nodes.
    // Chrome handles scroll restore well, unlike Safari.
    // Rounding helps avoid sub-pixel shifts.
    let top = Math.round(rect.top) * -1;
    // Check if any pages were actually removed.
    let rm = false;

    // Temporarily disable scroll handling during cleanup.
    ticking = true;
    const keys = Array.from(pages.keys());

    // Iterate through pages and remove all up to the current one.
    // Store order matches the order on screen.
    for (let i = 0; i < keys.length; i++) {
      const id = keys[i];
      if (currentPageId == id) break;
      rm = true;
      pages.delete(id);
    }

    // Wait for Svelte to re-render the DOM before continuing.
    // TODO: Consider a longer timeout if the browser is slow to update the DOM.
    await tick();

    if (rm) {
      // If nodes were removed — recalculate position.
      let _rect = currentPage.node.getBoundingClientRect();
      let _top = Math.round(_rect.top) * -1;

      // If the page shifted from its previous position — restore it.
      // This block is mainly for Safari, since Chrome handles it natively.
      if (top !== _top) {
        let diff = _top - top;

        // If this is a reload in Safari, wait for DOM update before restoring scroll.
        // TODO: Consider using MutationObserver instead.
        if (reload) {
          setTimeout(() => {
            scrollTo(0, scrollY - diff);
          }, 10);
        } else {
          // For other navigation cases, we just wait for a scroll event
          // which inevitably happens in Safari after DOM mutations.
          window.addEventListener("scroll", function f() {
            scrollTo(0, scrollY - diff);
            this.removeEventListener("scroll", f);
          });
        }
      }
    }

    ticking = false;
  }
</script>

<!-- Button for clear page-store -->
<button onclick={clear}>Reset page size: {pages.size}</button>

<ul>
  {#each pages as [id, data] (id)}
    <li use:linkItemNode={id}>
      <small>{data.language}</small>
      <h2>{data.name}</h2>
      <p>{data.bio}</p>
      <small>{data.version}</small>
    </li>
  {/each}
</ul>

<style>
  ul {
    display: flex;
    flex-direction: column;
    gap: 2em;
    padding: 0;
  }

  li {
    min-height: 80vh;
    width: 80%;
    font-size: clamp(1.25rem, 0.8594rem + 1.9531vw, 2.8125rem);
    background: rgb(241, 241, 241);
    padding: 20px;
    list-style: none;
  }

  button {
    position: fixed;
    bottom: 10px;
    right: 10px;
  }
</style>
