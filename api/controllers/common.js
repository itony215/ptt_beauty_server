
function getCountry(req, res) {
  const countryId = req.swagger.params.name.value || '';

  res.json({
    message: `the specific country id is ${countryId}`,
  });
}

module.exports = {
  getCountry,
}