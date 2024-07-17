<div class="home-container">
	<div class="home-copy">
		<h1>Welcome to BrandonXIANG Blog</h1>
		<p>
			Check out my <a
				href="https://github.com/brandonxiang"
				target="_blank"
				rel="noopener noreferrer">GitHub</a
			>.
		</p>
	</div>

	<figure>
		<img alt="Person typing on laptop" src="icon/undraw_usability_testing_2xs4.svg" />
		<figcaption>
			Illustration thanks to <a href="https://undraw.co" target="_blank" rel="noopener noreferrer"
				>Undraw</a
			>
		</figcaption>
	</figure>
</div>

<style>
	.home-container {
		align-items: center;
		display: flex;
		flex: 1;
		justify-content: center;
		margin: 2em 0;
		min-height: 400px;
	}
	.home-copy {
		flex: 1;
		min-height: 350px;
	}
	.home-copy img {
		width: 5em;
	}

	h1 {
		font-weight: 700;
		margin-bottom: 0.5em;
	}
	p {
		font-size: 1.4em;
		line-height: 1.5;
	}
	figure {
		margin: 0 1em;
		text-align: center;
	}
	figcaption {
		font-size: 0.8em;
		font-style: italic;
	}
	img {
		width: 100%;
		max-width: 400px;
	}
	@media (max-width: 1020px) {
		p {
			font-size: 1.2em;
		}
		img {
			max-width: 300px;
		}
	}
	@media (max-width: 800px) {
		.home-container {
			flex-direction: column;
		}
		.home-copy {
			flex: 0;
			padding-bottom: 2em;
			text-align: center;
			min-height: 180px;
		}
	}
</style>
