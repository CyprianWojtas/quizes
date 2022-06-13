import Quiestion from "./Question.js";

export default
class Quiz
{
	constructor(url)
	{
		this.url = url;
		this.questions = [];
	}

	async loadQuiz(forceReload)
	{
		let thisQuiz = this.getFromStorage();
		
		if (forceReload)
		{
			thisQuiz = await this.reloadQuiz();
			this.updateStorage(thisQuiz);
		}
		
		this.title = thisQuiz.title || "Unnamed Quiz";

		for (let queston of thisQuiz.questions || [])
		{
			this.questions.push(new Quiestion(queston));
		}
	}

	async reloadQuiz()
	{
		let quiz = await (await fetch(this.url)).json();

		let quizes = JSON.parse(localStorage.getItem("quizes") || "{}");

		this.quizId = quizes[this.url] || Object.keys(quizes).length;

		if (!quizes[this.url])
		{
			quizes[this.url] = this.quizId;
			localStorage.setItem("quizes", JSON.stringify(quizes));
		}

		localStorage.setItem(`quiz_${this.quizId}`, JSON.stringify(quiz));

		return quiz;
	}

	getFromStorage()
	{
		let quizes = JSON.parse(localStorage.getItem("quizes") || "{}");
		this.quizId = quizes[this.url];
		return JSON.parse(localStorage.getItem(`quiz_${this.quizId}`) || "{}");
	}

	updateStorage(thisQuiz)
	{
		if (!thisQuiz)
		{
			thisQuiz = {};

			thisQuiz.title = this.title;
			thisQuiz.questions = [];

			for (let question of this.questions)
			{
				thisQuiz.questions.push(question.toData());
			}
		}

		localStorage.setItem(`quiz_${this.quizId}`, JSON.stringify(thisQuiz));
	}

	getHTML()
	{
		const containerEl = document.createElement("div");
		containerEl.classList.add("quiz");

		const titleEl = document.createElement("h1");
		titleEl.append(this.title);

		this.questionEl = document.createElement("div");

		containerEl.append(titleEl, this.questionEl);

		this.showQuestion();
		return containerEl;
	}

	showQuestion()
	{
		let question = this.selectQuestion();

		question.onNextButton = () =>
		{
			this.updateStorage();
			this.showQuestion();
		};

		this.questionEl.innerHTML = "";
		this.questionEl.append(question.getHTML());
	}

	selectQuestion()
	{
		this.rearrangeQuestions();

		if (Math.random() < 0.5)
		{
			return this.questions[Math.floor(Math.random() * Math.floor(this.questions.length / 15))];
		}

		return this.questions[Math.floor(Math.random() * this.questions.length)];
	}

	rearrangeQuestions()
	{
		this.questions.sort((a, b) => b.correctRate - a.correctRate);
	}

	listQuestions()
	{
		this.rearrangeQuestions();

		for (let question of this.questions)
		{
			console.log(question.text, question.correctRate);
		}
	}
}