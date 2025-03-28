export function random(len:number):string{
    let pool = 'mnvdbvbdaukjcnadkcahfqeg67frt67tr7i2u4hifuge7dfgeifrg74rfieu74'
    let poolLen = pool.length;
    let ans:string = ""
    for(let i = 0 ; i < len; i++){
        let index = Math.floor(Math.random()*poolLen)
        ans += pool[index];
    }
    return ans;
}