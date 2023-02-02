export default
class Question
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

	checkAnswer(answerIndex)
	{
		if (this.answers[answerIndex].correct === true)
			return "correct";
		if (this.answers[answerIndex].correct === false)
			return "wrong";
		
		return "uncertain";
	}

	response(selectedAnswer, index)
	{
		if (this.answered)
			return;
		
		this.answerHistory.push(parseInt(index));

		for (let answerIndex of this.answerHistory.slice(-16))
		{
			const answerHistEl = document.createElement("div");
			answerHistEl.classList.add(this.checkAnswer(answerIndex));
			
			// @ts-ignore
			this.answerHistoryEl.append(answerHistEl);
		}

		if (this.answerHistory > 100)
			this.answerHistory.shift();
		
		this.answered = true;
		selectedAnswer.element.classList.add("selected", this.checkAnswer(index));
		// @ts-ignore
		this.containerEl.classList.add("answered");

		for (let i in this.answers)
		{
			const answer = this.answers[i];

			const answerCheck = this.checkAnswer(i);

			if (answerCheck != "wrong")
			{
				answer.element.classList.add(answerCheck);
			}
		}
	}

	get correctRate()
	{
		let rate = 0;
		let count = this.answerHistory.length;

		let theBestAnswer = "wrong";

		for (let i in this.answers)
		{
			const answerCheck = this.checkAnswer(i);

			if (answerCheck != "wrong" && theBestAnswer == "wrong")
				theBestAnswer = answerCheck;

			if (answerCheck == "correct" && theBestAnswer == "uncertain")
				theBestAnswer = answerCheck;
		}

		if (theBestAnswer == "wrong")
			return 1;

		for (let answerIndex of this.answerHistory)
		{
			switch (this.checkAnswer(answerIndex))
			{
				case "correct":
					rate++;
					break;
				case "uncertain":
					if (theBestAnswer == "uncertain")
						rate++;
					else
						count--;
			}
		}

		if (count)
			rate /= count;

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
