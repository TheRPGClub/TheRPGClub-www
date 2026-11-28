import numpy as np
from PIL import Image
import sys
def caustic(size, cells, seed, warp):
    rng=np.random.default_rng(seed)
    pts=rng.random((cells,2))*size
    y,x=np.mgrid[0:size,0:size].astype(np.float32)
    # domain warp (tileable sin warp)
    t=2*np.pi/size
    xw=x+warp*np.sin(y*t*2+1.3)+warp*0.5*np.sin(x*t*3+0.4)
    yw=y+warp*np.sin(x*t*2+2.1)+warp*0.5*np.cos(y*t*3+0.9)
    d1=np.full((size,size),1e9,np.float32); d2=d1.copy()
    for px,py in pts:
        dx=np.abs(xw-px); dx=np.minimum(dx,size-dx)
        dy=np.abs(yw-py); dy=np.minimum(dy,size-dy)
        d=np.sqrt(dx*dx+dy*dy)
        m=d<d1
        d2=np.where(m,d1,np.minimum(d2,d))
        d1=np.where(m,d,d1)
    e=d2-d1
    cell=size/np.sqrt(cells)
    v=np.clip(1-e/(cell*0.16),0,1)**2.2
    return v
size=512
a=caustic(size,26,7,18)
b=caustic(size,40,11,12)
for name,v in (("caustics-a.png",a),("caustics-b.png",b)):
    alpha=(np.clip(v,0,1)*255).astype(np.uint8)
    img=np.zeros((size,size,4),np.uint8); img[...,0]=255; img[...,1]=255; img[...,2]=255; img[...,3]=alpha
    Image.fromarray(img,'RGBA').save(sys.argv[1]+"/"+name,optimize=True)
