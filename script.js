
const BACKEND_URL = "https://bebella-modas-repo-1.onrender.com";

let cart = [];

function addToCart(name, price) {
  cart.push({name, price});
  updateCart();
}

function updateCart() {
  let list = document.getElementById('cart-items');
  list.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    total += item.price;
    let div = document.createElement('div');
    div.innerText = item.name + " - R$ " + item.price.toFixed(2);
    list.appendChild(div);
  });

  document.getElementById('total').innerText = total.toFixed(2);
}

async function checkout() {
  if (cart.length === 0) {
    alert("O carrinho está vazio!");
    return;
  }

  const items = cart.map(i => ({
    title: i.name,
    quantity: 1,
    unit_price: i.price
  }));

  const resp = await fetch(BACKEND_URL + "/create_payment", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({items})
  });

  const data = await resp.json();
  if (data.init_point) {
    window.location.href = data.init_point;
  } else {
    alert("Erro ao criar pagamento!");
  }
}
