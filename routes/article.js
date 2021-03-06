var express = require('express'),
    db = require('../db');

var app = express();
module.exports = app;

app.get('/', function(req, res, next){

    const COUNT_PRE_PAGE = 5;  //1ページの記事数
    
    var query = null;
    if(req.param('lt')){ //次以降のページ
	query = {createdAt:{$lt: req.param('lt')}}  //作成日が/?lt=xxxx未満のもの
	}else{ //最初のページ
	    query = {}; //すべての記事
	    }

    //find
    //引数1: query
    //引数2: 取り出すフィールド: 指定なし　＝　すべて
    //引数3: オプション、 sort: 作成日順にすべて取り出し, limit: 最大　COUNT_PER_PAGE+1件
    //
    //populate
    //authorのオブジェクトも取り出す Articleモデルのauthor参照

    db.Article.find(query, {}, {limit:COUNT_PER_PAGE+1, sort:{createdAt:-1}}).populate('author').exec(function(error, articles){
     
       if(error) return next(error);

	//ページネーション
        var next = null
	   if(articles.length >= COUNT_PER_PAGE+1){
	   //記事がcount_PER_PAGE+1あれば次のページがある
	   articles.pop(); //最後を削除してCOUNT_PER_PAGE件にする
	   next = articles[COUNT_PER_PAGE-1].createdAt.getTime();  //最後の記事(COUNT_PER_PAGE件目）のcreatedAtを次のltにする
	   }

	return res.render('article', {articles:articles, next:next});

    });

});


app.get('/article/:id', function(req, res, next){
    db.Article.findById(req.param('id')).populate('author').exec(function(error, article){
	if(error) return next(error);

	res.render('one_article', {article:article});

	});
});


//



app.post('/article/:id/like', function(req, res, next){
    db.Article.likeArticle(req.param('id'), function(error){
	if(error) return next(error);
	res.json({});
	})
});

app.post('/article/:id/comment', function(req, res, next){
    var text = req.param('text');
    if(!text || text.length === 0) return res.json({}, 400);

    db.Article.addComment(req.param('id'), text, function(error, article){
	if(error) return next(error);
	res.jason(article);
	})
});







