import Question from "./Question.js";

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
		
		if (forceReload || !thisQuiz)
		{
			thisQuiz = await this.reloadQuiz();
			this.updateStorage(thisQuiz);
		}
		
		this.title = thisQuiz.title || "Unnamed Quiz";

		for (let queston of thisQuiz.questions || [])
		{
			this.questions.push(new Question(queston));
		}
	}

	async reloadQuiz()
	{
		let quiz = await (await fetch(this.url)).json();

		let quizes = JSON.parse(localStorage.getItem("quizes") || "{}");

		this.quizId = quizes[this.url]?.id || Object.keys(quizes).length + 1;

		if (!quizes[this.url])
		{
			quizes[this.url] = { id: this.quizId, title: quiz.title };
			localStorage.setItem("quizes", JSON.stringify(quizes));
		}

		localStorage.setItem(`quiz_${this.quizId}`, JSON.stringify(quiz));

		return quiz;
	}

	getFromStorage()
	{
		let quizes = JSON.parse(localStorage.getItem("quizes") || "{}");
		this.quizId = quizes[this.url]?.id;
		return JSON.parse(localStorage.getItem(`quiz_${this.quizId}`) || "null");
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

	updateQuestionListEl()
	{
		this.questionListEl.innerHTML = "";
		this.rearrangeQuestions("answerCount");

		for (let question of this.questions)
		{
			const questionEl = document.createElement("div");

			const textEl = document.createElement("h2");
			textEl.classList.add("questionText");
			// TODO: safer html insertion method
			textEl.innerHTML = question.text;

			const answerHistoryEl = document.createElement("div");
			answerHistoryEl.classList.add("answerHistory");

			for (let answerIndex of question.answerHistory.slice(-10))
			{
				const answerHistEl = document.createElement("div");
				answerHistEl.classList.add(question.checkAnswer(answerIndex));
				answerHistoryEl.append(answerHistEl);
			}

			questionEl.append(textEl, answerHistoryEl);

			this.questionListEl.append(questionEl);
		}
	}

	getHTML()
	{
		const containerEl = document.createElement("div");
		containerEl.classList.add("quizInfo");
		
		const titleEl = document.createElement("h1");
		titleEl.append(this.title);
		
		const urlEl = document.createElement("h3");
		urlEl.append(this.url);

		const startBtnEl = document.createElement("button");
		startBtnEl.classList.add("startQuizBtn");
		startBtnEl.append("Start Quiz")
		startBtnEl.addEventListener("click", () =>
		{
			document.body.append(this.getQuestionEl());
		});

		this.questionListEl = document.createElement("div");
		this.updateQuestionListEl();

		const reloadDatabase = document.createElement("button");
		reloadDatabase.classList.add("reloadDatabase");
		reloadDatabase.append("Update quiz database");
		reloadDatabase.addEventListener("click", async () =>
		{
			if(confirm("Are sure?\nThis gonna clear your answer history"))
			{
				let quiz = await this.reloadQuiz();
				this.updateStorage(quiz);
			}
		});

		containerEl.append(titleEl, urlEl, startBtnEl, this.questionListEl, reloadDatabase);

		return containerEl;
	}

	getQuestionEl()
	{
		const containerEl = document.createElement("div");
		containerEl.classList.add("quiz");

		const closeButtonEl = document.createElement("button");
		closeButtonEl.classList.add("closeBtn");
		closeButtonEl.append("X");

		closeButtonEl.addEventListener("click", () =>
		{
			this.updateQuestionListEl();
			containerEl.remove();
		});


		const titleEl = document.createElement("h1");
		titleEl.append(this.title);

		this.questionEl = document.createElement("div");

		containerEl.append(closeButtonEl, titleEl, this.questionEl);

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

		// @ts-ignore
		this.questionEl.innerHTML = "";
		// @ts-ignore
		this.questionEl.append(question.getHTML());
	}

	selectQuestion()
	{
		this.rearrangeQuestions(Math.random() > 0.5 ? "correctRate" : "answerCount");
		this.questions.reverse();

		if (Math.random() < 0.75)
		{
			return this.questions[Math.floor(Math.random() * Math.floor(this.questions.length / 10))];
		}

		return this.questions[Math.floor(Math.random() * this.questions.length)];
	}

	rearrangeQuestions(method = "correctRate")
	{
		switch (method)
		{
			case "correctRate":
				this.questions.sort((a, b) => b.correctRate - a.correctRate);
				break;
			case "answerCount":
				this.questions.sort((a, b) => b.answerHistory.length - a.answerHistory.length);
				break;
		}
	}

	listQuestions()
	{
		this.rearrangeQuestions();

		for (let question of this.questions)
		{
			console.log(question.text, question.correctRate, question.answerHistory.length);
		}
	}
}