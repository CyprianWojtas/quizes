export default
class Quiestion
{
	constructor(data)
	{
		this.text = data.text;
		this.answers = data.answers;
		this.answered = false;
		this.answerHistory = data.answerHistory || [];
		this.onNextButton = () => undefined;
	}

	getHTML()
	{
		this.answered = false;

		this.containerEl = document.createElement("div");
		this.containerEl.classList.add("question");

		const textEl = document.createElement("h2");
		textEl.classList.add("questionText");
		// TODO: safer html insertion method
		textEl.innerHTML = this.text;

		this.answerHistoryEl = document.createElement("div");
		this.answerHistoryEl.classList.add("answerHistory");

		const answersContainerEl = document.createElement("div");
		answersContainerEl.classList.add("answers");

		let answersIds = [];

		for (let i = 0; i < this.answers.length; i++)
			answersIds.push(i);


		while (answersIds.length)
		{
			const i = answersIds.splice(Math.floor(Math.random() * answersIds.length), 1)[0];
			
			const answer = this.answers[i];
			const answerEl = document.createElement("button");
			answerEl.classList.add("answer");

			answer.element = answerEl;

			// TODO: safer html insertion method
			answerEl.innerHTML = answer.text;

			answerEl.addEventListener("click", () => this.response(answer, i));

			answersContainerEl.append(answerEl);
		}

		let nextButtonEl = document.createElement("button");
		nextButtonEl.classList.add("next");
		nextButtonEl.append("Next");
		nextButtonEl.addEventListener("click", () => this.onNextButton());

		this.containerEl.append(textEl, this.answerHistoryEl, answersContainerEl, nextButtonEl);

		return this.containerEl;
	}

	response(selectedAnswer, index)
	{
		if (this.answered)
			return;
		
		this.answerHistory.push(parseInt(index));

		for (let answerIndex of this.answerHistory.slice(-10))
		{
			let answerHistEl = document.createElement("div");
			answerHistEl.classList.add(this.answers[answerIndex].correct ? "correct" : "wrong");
			this.answerHistoryEl.append(answerHistEl);
		}

		if (this.answerHistory > 100)
			this.answerHistory.shift();
		
		this.answered = true;
		selectedAnswer.element.classList.add("selected", selectedAnswer.correct ? "correct" : "wrong");
		this.containerEl.classList.add("answered");

		for (const answer of this.answers)
		{
			if (answer.correct)
			{
				answer.element.classList.add("correct");
			}
		}
	}

	get correctRate()
	{
		let rate = 0;
		for (let answerIndex of this.answerHistory)
		{
			if (this.answers[answerIndex].correct)
				rate++;
		}

		if (this.answerHistory.length)
			rate /= this.answerHistory.length;

		return rate;
	}

	toData()
	{
		let questionData =
		{
			text: this.text,
			answers: this.answers,
			answerHistory: this.answerHistory
		};

		return questionData;
	}
}