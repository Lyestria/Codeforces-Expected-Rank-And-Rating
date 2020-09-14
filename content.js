async function getJSON(url) {
	return (await fetch(url)).json();
}

//Gets ratings of contestants in batches os the url does not exceed 5640 characters (largest safe bound, Codeforces API website is a lie.)
//For live contests
async function assignRatings(users){
	let beg=0,norm=`https://codeforces.com/api/user.info?handles=`.length-1,len=norm,lim=5000;//why?????
	for(let i=0;i<=users.length;){
		if(beg == users.length) return;
		if(i != users.length) len += users[i].handle.length + 1;
		if(i == users.length || len >= lim){
			let sec=users.slice(beg, i);
			console.log(`https://codeforces.com/api/user.info?handles=${sec.map((cont) => cont.handle).join(';')}`);
			console.log(len);
			let userInfo = (await getJSON(`https://codeforces.com/api/user.info?handles=${sec.map((cont) => cont.handle).join(';')}`)).result;
			for(let j=0; j<sec.length; j++)sec[j].rating = userInfo[j].rating;
			console.log(`Ratings Found: ${beg+1} - ${i}`);
			beg = i, len = norm;
		}
		else i++;
	}
}

function assign_ranks(contestents, s, e) {
	let rk = (s+e-1)*0.5;
	while (s< len) contestents[s++]=rk;
}

function addElements(contestants,f,label){
	contestants=contestants.reduce((acc,cur) => {
		acc[cur.handle]=cur;
	}, {});
	var list= $('.standings').children().eq(0).children();
	list.eq(0).append(`<th class="top" style="width:4em;"><span>${label}</span></th>`);
	list.slice(1).forEach( (el) =>{
		let user=el.children().eq(1).children().eq(1).text();
		el.append(f(user));
	})
}

async function main() {
	//get contest code
	var code = window.location.pathname.split('/')[2];
	console.log(code);
	var ranking;
	try{
		//try to get past rating changes
		ranking = (await getJSON(`https://codeforces.com/api/contest.ratingChanges?contestId=${code}`)).result.map((e) =>
		({rating: e.oldRating, rank: e.rank, handle: e.handle, delta: e.newRating-e.oldRating}));
	}
	catch(e){
		//get standings otherwise
		obj = await getJSON(`https://codeforces.com/api/contest.standings?contestId=${code}`);
		ranking = obj.result.rows
		.map((e) => ({handle: e.party.members[0].handle, rank: e.rank}));
		//forcefully get ratings
		assignRatings(ranking);
	}
	//reassign ranks
	let beg=0;
	for (let i=1; i<n; i++){
		if(ranking[i].rank != ranking[i-1].rank){
			assign_ranks(ranking,beg,i);
			beg=i;
		}
	}
	assign_ranks(ranking,beg,n);

	calculateExpectedRank(ranking);
	addElements(ranking, (user) => 
		`<td><span style="color:black;font-weight:bold;">${contestants.user === undefined ? "-" : contestants.user.expected_rank}</span></td>`, "E(r)");

	if(ranking[0].delta === undefined)calculateDeltas(ranking);
	addElements(ranking, (user) =>{
		if(contestants.user === undefined)return `<td><span style="color:black;font-weight:bold;">-</span></td>`
		else if(contestants.user.delta == 0)return `<td><span style="color:black;font-weight:bold;">0</span></td>`
		else if(contestants.user.delta > 0)return `<td><span style="color:green;font-weight:bold;">+${contestants.user.delta}</span></td>`
		else return `<td><span style="color:red;font-weight:bold;">${ccontestants.user.delta}</span></td>`
	}, "Δ");

}

main();