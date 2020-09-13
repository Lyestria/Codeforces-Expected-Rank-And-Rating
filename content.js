async function getJSON(url) {
	return (await fetch(url)).json();
}

async function getRating(user){
	return (await getJSON(`https://codeforces.com/api/user.info?handles=${user}`)).result[0].rating;
}

function assign_ranks(contestents, s, e) {
	let rk = (s+e-1)*0.5;
	while (s< len) contestents[s++]=rk;
}

async function main() {
	var code = window.location.pathname.split('/')[2];
	console.log(code);

	var obj = getJSON(`https://codeforces.com/api/contest.standings?contestId=${code}`);
	if(obj.status != "OK")return;

	var ranking = Object.entries(obj.result.rows).map((e) => ({handle: e[1].party.members[0].handle, rank: e[1].rank}));
	ranking.forEach((e) => e[1].rating = await getRating(e[0]));

	let beg=0;
	for (let i=1; i<n; i++){
		if(ranking[i].rank != ranking[i-1].rank){
			assign_ranks(ranking,beg,i);
			beg=i;
		}
	}
	assign_ranks(ranking,beg,n);

	calculateExpectedRank(ranking);
	calculateDeltas(ranking);

	ranking = ranking.reduce((acc,cur) => {
		acc[cur.handle]=cur;
	}, {})
	/*
	$('#users-table').children().eq(0).children().eq(0).append("<th class=\"rank\">+</th>");
	var rows = $('#users-table').children().eq(1).children();
	for (var i = 0; i < n; i++) {
		var el;
		if (deltas[i] > 0) el = "<td class=\"full-score\">+" + deltas[i] + "</td>";
		else if (deltas[i] < 0) el = "<td class=\"failed-score\">" + deltas[i] + "</td>";
		else el = "<td class=\"user-points\">0</td>";
		rows.eq(i).append(el);
	}

	console.log(old_rating);
	console.log(old_volatility);
	console.log(times_rated);
	console.log(deltas.reduce((a, c) => a + c));
	*/
}
main();