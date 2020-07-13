const github = require('octonode').client(process.env.GITHUB_ACCESS_TOKEN)

const fetchGrass = async () => {
  console.log('Taking a look at the yard.')
  const lawnjunk = await github.org('lawnjunk')
  let page = 1
  let results =  []
  while(true){
    const [repos, response] = await lawnjunk.reposAsync({ per_page: 100, page})
    results = results.concat(repos)
    page++
    if(response.link.indexOf('rel="next"') == -1) break;
  }
  console.log(`Lawnjunk has ${results.length} patches of grass`)
  return results
}

const mowPatch = async (repo) => {
  const {archived, full_name} = repo
  if(!archived){
    repo = await github.repo(full_name)
    await repo.updateAsync({archived: true})
  }
  console.log('mowed', full_name)
}

const mowGrass = async (grass) => {
  const longGrass = grass.filter(grass => !grass.archived)
  if(longGrass.length){
    console.log(`${longGrass.length} patche(s) need to be mowed.`)
    await Promise.all(longGrass.map(mowPatch))
    return console.log('The lawn has been mowed!')
  }
  console.log(`The lawn has all ready been mowed.`)
}

const main = async () => {
  const grass = await fetchGrass()
  await mowGrass(grass)
}

main()
.catch(e => {
  console.error(e)
  process.exit(1)
})
