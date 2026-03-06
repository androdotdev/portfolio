async function startLogger(){

 const res = await fetch("data/logs.json")
 const logs = await res.json()

 const container = document.getElementById("log-container")

 logs.forEach(log=>{
   const line = document.createElement("div")
   line.textContent = log
   container.appendChild(line)
 })

}
