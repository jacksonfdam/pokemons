import express from 'express';
import Pokemon from '../models/pokemons';
import { Router } from 'express';


export default ({ db }) => {
	let api = Router();

	api.get('/get-pokemons', function (req, res) {
		Pokemon.findAll()
		.then(function listOfPokemons(pokemons){
			res.send(pokemons);
		})
	});

	api.post('/create-pokemons', function (req, res) {
		Pokemon.create(req.body)
		.then(function sendPokemon(pokemon){
			res.send(pokemon)
		})
	});

	api.post('/buy-pokemons', function (req, res) {
		Pokemon.findOne({
			where: {
				name: req.body.name
			}
		})
		.then(function(pokemon) {
			if (pokemon.stock < req.body.quantity) {
				return res.status(400).send({
					error: 'Not enought ' + pokemon.name + ' in stock: ' + pokemon.stock
				})
			}

			request({
				uri: 'https://api.pagar.me/1/transactions',
				method: 'POST',
				json: {
					api_key: "ak_test_WHgSu2XFmvoopAZMetV3LfA2RfEEQg",
					amount: pokemon.price * req.body.quantity * 100,
					card_number: "4024007138010896",
					card_expiration_date: "1050",
					card_holder_name: "Ash Ketchum",
					card_cvv: "123",
					metadata: {
						product: 'pokemon',
						name: pokemon.name,
						quantity: req.body.quantity
					}
				}
			})
			.then(function (body){
				if (body.status == 'paid') {

					pokemon.stock = pokemon.stock - req.body.quantity;
					pokemon.save()
					.then(function(pokemon) {
						res.send(body);
					})
				}
			})
			.catch(function (err){
				console.log(JSON.stringify(err, null, 4));
				return res.status(err.response.statusCode).send(err.response.body);
			})

		})

	});


	return api;
}

