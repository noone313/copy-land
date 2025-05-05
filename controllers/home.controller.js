const homePage = (req, res) => {
    res.render('index', { title: 'Home Page' });
}

export { homePage };