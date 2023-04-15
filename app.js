const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = Math.floor(window.innerWidth);
canvas.height = Math.floor(window.innerHeight);
window.addEventListener('load', ()=>{    
    class Particle{
        constructor(x, y, effect, color){
            this.effect = effect;
            this.x = Math.random()*this.effect.width;
            this.y = Math.random()*this.effect.height;
            this.originX = Math.floor(x);
            this.originY = Math.floor(y);
            this.size = this.effect.gap;
            this.color = color;
            this.friction = 0.98;
            this.vx = 0;
            this.vy = 0;
            this.dx = 0;
            this.dy = 0;
            this.distance = 0;
            this.force = 0;
            this.angle = 0;
            this.ease = 0.1;
        }
        Draw(context){
            context.fillStyle = this.color;
            context.fillRect(this.x, this.y, this.size, this.size);
        }
        Update(){
            this.dx = this.effect.mouse.x - this.x;
            this.dy = this.effect.mouse.y - this.y;
            this.distance = (this.dx*this.dx)+(this.dy*this.dy);
            this.force = -this.effect.mouse.radius / this.distance;

            if (this.distance<this.effect.mouse.radius) {
                this.angle = Math.atan2(this.dy, this.dx);
                this.vx += this.force * Math.cos(this.angle);
                this.vy +=  this.force * Math.sin(this.angle);
            }

            this.x += (this.vx*=this.friction) + (this.originX-this.x)*this.ease;
            this.y += (this.vy*=this.friction) + (this.originY-this.y)*this.ease;
        }
    }
    class Effect{
        constructor(width, height){
            this.width = width;
            this.height = height;
            this.particlesArray = []
            this.img = document.getElementById('img1');
            this.imgX = 0;
            this.imgY = 0;
            this.gap = 3;
            this.mouse = {
                radius: 3000,
                x: undefined,
                y: undefined
            }
            window.addEventListener('mousemove', event=>{
                this.mouse.x = event.x;
                this.mouse.y = event.y;
            })
        }


        async Init(context){
            await fetch (`https://pokeapi.co/api/v2/pokemon/${Math.floor(Math.random()*600)+1}`).then((response)=>response.json()).then((data)=>{
                this.img.src = data.sprites.other['dream_world'].front_default;
                this.img.crossOrigin = 'Anonymous';
                this.img.addEventListener('load', ()=>{
                    this.imgX = (this.width-this.img.width)/2;
                    this.imgY = (this.height-this.img.height)/2;
                    context.drawImage(this.img, this.imgX, this.imgY);
                    const pixels = context.getImageData(0, 0, this.width, this.height).data;
                    for (let y=0; y<this.height; y+=this.gap){
                        for (let x=0; x<this.width; x+=this.gap){
                            const index = (y*this.width + x) * 4;
                            const red = pixels[index];
                            const green = pixels[index+1];
                            const blue = pixels[index+2];
                            const alpha = pixels[index+3];
                            const color = `rgb(${red}, ${green}, ${blue})`;

                            if(alpha > 0){
                                this.particlesArray.push(new Particle(x, y, this, color))
                            }
                        }
                    }
                    console.log(this.particlesArray)
                })
            });
        }
        Draw(context){
            this.particlesArray.forEach(particle=>particle.Draw(context));
        }
        Update(){
            this.particlesArray.forEach(particle=> particle.Update());
        }
    }
    const effect = new Effect(canvas.width, canvas.height);
    function animate(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        effect.Draw(ctx)
        effect.Update();
        //console.log(effect.particlesArray[0].x, effect.particlesArray[0].y)
        requestAnimationFrame(animate);
    }
    effect.Init(ctx);
    animate();
})