/** Lightbox for images in the article body and the cover. PhotoSwipe is fetched on first click. */
document.addEventListener('click', async (event) => {
  const target = event.target
  if (!(target instanceof HTMLImageElement)) return
  if (!target.closest('.prose, #post-cover') || target.closest('a')) return
  event.preventDefault()
  const [{ default: PhotoSwipe }] = await Promise.all([
    import('photoswipe'),
    import('photoswipe/style.css'),
  ])
  const pswp = new PhotoSwipe({
    dataSource: [
      {
        src: target.currentSrc || target.src,
        width: target.naturalWidth || window.innerWidth,
        height: target.naturalHeight || window.innerHeight,
        alt: target.alt,
      },
    ],
    bgOpacity: 0.94,
    padding: { top: 24, bottom: 24, left: 24, right: 24 },
    imageClickAction: 'close',
    tapAction: 'close',
    doubleTapAction: 'zoom',
    wheelToZoom: true,
    arrowPrev: false,
    arrowNext: false,
  })
  pswp.init()
})
