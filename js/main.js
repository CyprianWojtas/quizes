import Quiz from "./Quiz.js";

const quizListEl = document.getElementById("quizList");
const quizInfoEl = document.getElementById("quizInfo");

function reloadQuizList()
{
	quizListEl.innerHTML = "";
	let allQuizes = JSON.parse(localStorage.getItem("quizes") || "{}");

	let allQuizesList = Object.keys(allQuizes);

	allQuizesList.sort((a, b) => allQuizes[a].title == allQuizes[b].title ? 0 : allQuizes[a].title > allQuizes[b].title ? 1 : -1 );

	for (let quizUrl of allQuizesList)
	{
		let quiz = allQuizes[quizUrl];

		// Fixing issue with prevous quiz list storage format
		if (typeof quiz != "object")
		{
			let quizFull = JSON.parse(localStorage.getItem(`quiz_${ quiz }`) || "{}");
			quiz =
			{
				id: quiz,
				title: quizFull.title
			};

			allQuizes[quizUrl] = quiz;
			localStorage.setItem("quizes", JSON.stringify(allQuizes));
		}

		const quizListItemEl = document.createElement("a");
		quizListItemEl.classList.add("quizListItem");
		quizListItemEl.href = `#${quizUrl}`;
		
		const quizTitleEl = document.createElement("h3");
		quizTitleEl.append(quiz.title);

		const quizUrlEl = document.createElement("div");
		quizUrlEl.append(quizUrl);

		quizListItemEl.append(quizTitleEl, quizUrlEl);
		quizListEl.append(quizListItemEl);
	}
}

reloadQuizList();

async function loadQuiz()
{
	if (!location.hash.substring(1))
		return;

	let quiz = new Quiz(location.hash.substring(1));

	await quiz.loadQuiz();
	
	reloadQuizList();

	quizInfoEl.innerHTML = "";
	quizInfoEl.append(quiz.getHTML());

	// quiz.listQuestions();
}

addEventListener("hashchange", loadQuiz);
loadQuiz();