from PIL import Image

def leftmost_dark(img, y0, y1, x0=0, x1=None, thresh=120):
    """Return smallest x in [x0,x1) where some row in [y0,y1) has a pixel darker than thresh."""
    w, h = img.size
    if x1 is None: x1 = w
    px = img.convert("L").load()
    best = None
    for x in range(x0, x1):
        for y in range(y0, y1):
            if px[x, y] < thresh:
                best = x
                break
        if best is not None:
            break
    return best

def rightmost_dark(img, y0, y1, x0=0, x1=None, thresh=120):
    w, h = img.size
    if x1 is None: x1 = w
    px = img.convert("L").load()
    for x in range(x1-1, x0-1, -1):
        for y in range(y0, y1):
            if px[x, y] < thresh:
                return x
    return None

def report(path, regions):
    img = Image.open(path)
    print(f"\n== {path}  size={img.size} ==")
    for name, (y0, y1, x0, x1, th) in regions.items():
        l = leftmost_dark(img, y0, y1, x0, x1, th)
        print(f"  {name:16s} y[{y0}-{y1}] x[{x0}-{x1}] thr{th} -> left={l}")

# about-us 1440: logo row ~ y18-44; eyebrow ~y115-128; big title ~y150-205
report("/mnt/c/dev/notes/newsletter-preview/diag-aboutus-1440.png", {
    "logo":   (15, 48, 60, 400, 120),
    "eyebrow":(112, 132, 60, 600, 150),
    "title":  (150, 210, 60, 600, 120),
    "body":   (360, 400, 60, 900, 150),
})

# newsletter 6xl 1440: logo ~ y18-44; eyebrow ~y114-130; title ~y150-210
report("/mnt/c/dev/notes/newsletter-preview/diag-home-6xl-1440.png", {
    "logo":   (15, 48, 60, 400, 120),
    "eyebrow":(112, 132, 60, 600, 150),
    "title":  (150, 215, 60, 700, 120),
})
