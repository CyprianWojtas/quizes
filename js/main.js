import Quiz from "./Quiz.js";

(async () =>
{
	if (!location.hash.substring(1))
	{
		document.body.append("No quiz selected!");
		return;
	}

	let quiz = new Quiz(location.hash.substring(1));

	await quiz.loadQuiz();

	document.body.append(quiz.getHTML());

	// quiz.listQuestions();
})();