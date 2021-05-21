 get_json = async (url) => (await fetch(url)).json()

 handles_lookup_url = (handles) => `https://codeforces.com/api/user.info?handles=${handles.join(';')}`

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

const label = '<th class="top" style="width:4em;"><span>%1</span></th>';
const cell = '<td><span style="color:%1;font-weight:bold;">%2</span></td>';

//async.retry simplified: tries task until no error occurs
async function retry(interval, task) {
	try {
		return await task();
	}
	catch (err) {
		await sleep(interval);
		return await retry(interval, task);
	}
}


const length_limit = 5000;
let base_length;
let code;
let attempt_interval = 1000; //Randomize to avoid concurrency
let rest_time = 500;

//Gets ratings of contestants in batches so the url does not exceed 5640 characters (largest safe bound, Codeforces API website is a lie.)
//For live contests
async function get_ratings(users){
	let section_begin = 0;
	let current_length = base_length;
	let handles = users.map((user) => user.handle);
	let queries = [];

	//We will query by sections to minimize number of requests
	for(let i=0;i<=handles.length;){
		if(section_begin == handles.length) return; //We are done
		let end_section = false;

		if(i == handles.length) end_section = true;
		else if(current_length + handles[i].length + 1 <= length_limit) {
			current_length += handles[i].length + 1;
		}
		else end_section = true;

		if(end_section){ //We want to query a new block of handles
			let section_handles = handles.slice(section_begin, i);
			queries.push(make_query(section_begin, i, section_handles));
			await sleep(rest_time); //Wait and give server time to rest
			section_begin = i;
			current_length = base_length;
		}
		else ++i;
	}
	results = await Promise.all(queries);
	results.forEach((query) => {
		let result = query.response.result;
		for(let i = 0; i < query.end - query.begin; i++) {
			users[query.begin + i].oldRating = result[i].rating;
		}
	});
}

async function make_query(begin, end, handles) {
	let result = {
		begin : begin,
		end: end,
		response: await retry(attempt_interval, () => get_json(handles_lookup_url(handles)))
	};
	console.log(`Users ${begin} - ${end} Found`);
	console.log(`URL Length: ${handles_lookup_url(handles).length}`);
	return result;
}


//Assigns the average rank to numbers
function assign_ranks(ranking, s, e) {
	let rk = (s+e-1)*0.5+1;
	while (s< e) ranking[s++].rank=rk;
}


async function main() {
	code = window.location.pathname.split('/')[2]; //get contest code
	base_length = handles_lookup_url([]).length;
	
	console.log(code);

	let ranking;
	try{
		//try to get past rating changes
		ranking = (await get_json(`https://codeforces.com/api/contest.ratingChanges?contestId=${code}`))
		.result.map((e) => ({
			rating: e.oldRating,
			rank: e.rank, 
			handle: e.handle, 
			delta: e.newRating-e.oldRating}));
	}
	catch(e){
		console.time()
		//get standings otherwise
		obj = await get_json(`https://codeforces.com/api/contest.standings?contestId=${code}`);
		ranking = obj.result.rows
		.map((e) => ({handle: e.party.members[0].handle, rank: e.rank}));

		//forcefully get ratings
		await get_ratings(ranking);
		console.timeEnd()
	}
	console.log("Ratings Collected");

	//reassign ranks
	let begin=0;
	for (let i=1; i < ranking.length; i++){
		if(ranking[i].rank != ranking[i-1].rank){
			assign_ranks(ranking,begin,i);
			begin = i;
		}
	}
	assign_ranks(ranking,begin, ranking.length);
	console.time();
	await calculate_deltas(ranking);
	console.log("Ratings Calculated");
	console.timeEnd();

	let ranking_dict = {}; 
	ranking.forEach((user) => {
		ranking_dict[user.handle] = user;
	});

	let header = $('.standings tr:eq(0)');
	let rows = $('.standings tr').slice(1,-1);

	header.append(label.replace('%1', 'E(r)'));
	header.append(label.replace('%1', 'Δ'));

	rows.each(function() {
		let handle = $(this).find('a').text();
		$(this).append(cell
			.replace('%1', 'black')
			.replace('%2', ranking_dict[handle].expected_rank));
		let delta = ranking_dict[handle].delta;
		let color = delta > 0 ? 'green' :
			(delta <0 ? 'red' : 'black');
		let display = delta > 0 ? `+${delta}` : delta;
		$(this).append(cell
			.replace('%1', color)
			.replace('%2', display));
	});
}

main();