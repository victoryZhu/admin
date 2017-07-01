//高度计算 toppage 25+1  head 22+1   td 22+1  加1均为框线，有一边是共用，只要加1
//title caption部分高度计算 ie 14 firefox 15 padding 0.3em fontsize 12px     14(15)+6+1
//tabs ul 34 +3(padding)+2（此2为ul的 框线） tabs最外层框线默认有，已去掉，与上帧统一，如果不去，上层最外层需加一框线，此时grid表格的宽度在resize时就要减法4(表格本身外层框线+外层层框线),为$(window).width()-4，初始时就不能用autowidth:true,也要改成width:$(window).width()-4
//工具栏26+翻页栏26+各列标题23+表头21(22)=96(97)+外框线2=98(99)大约100  明细没有表头则为约78
//总高减上述100或78 ，再除以数据行高23 ，得行数
var toolbarheight=26;//工具栏，实际就是COPY翻页栏
var pagebarheight=26;//翻页栏，
var titleheight=23;//各列标题
var captionheight=22;//表头
var outborderwidth=2;//外框线
var TopBottomRate=0.38;//上下帧比例
var TopGridOtherBarHeight=99;//100;上帧jqGrid中各类bar的总高度（toolbarheight+pagebarheight+titleheight+captionheight+outborderwidth)
var BottomGridOtherBarHeight=77;//78;下帧jqGrid中各类bar的总高度（不含Caption部分）
var GridRowHeight=23;//jqGrid每行高度
var TabsUlHeight=37;//48;//39;Tabs中标签的高度，随BODY中定义的font-size会变,
//有些高度值通过下面方法进行取出来参考，放入WINDOW.RESIZE()中进行调试
//  alert($("#tabs ul").outerHeight()); // 37
//  alert($("#gview_toplist .ui-jqgrid-caption").outerHeight()); // 21
//  alert($("#gview_toplist .ui-jqgrid-hdiv").outerHeight()); // 23
//  alert($("#toplist_toppager").outerHeight()); //26
//  alert($("#toppager").outerHeight());  //26
//  alert($("#gbox_toplist").outerHeight()); 
//  alert($("#gview_toplist").outerHeight());

var doch=768;//页面高度
var topdivh=292;//上帧高度
var tabsh=476;//tab高度
var numOfTopRow=8;//上帧行数
var numOfBottomRow=8;//下帧行数
var topGridHeight=topdivh-TopGridOtherBarHeight;//上帧纯表格高度
var bottomGridHeight=tabsh-TabsUlHeight-BottomGridOtherBarHeight;//下帧纯表格高度
var jqmodal_jqgrid_init_flag=false;//弹出层窗口中使用jqgrid初始化时设为true,防止主窗口的RESIZE事件执行

//jqGrid可定义属性模板
var yesNotemplate={stype:'select',searchoptions:{sopt:['eq','ne'],value:"Y:Yes;N:No"}};
 
//jqGrid自定义编辑栏位属性
function myelem(value,options){
	//return $('<input type="text" value="'+value+'"disabled="disabled"/>');
	return $('<input type="hidden" value="'+value+'"/>');
}
function myval(elem){
	return elem.val();
}

//上帧下帧高度及行数计算
function t_b_height_rownum(){ 	
	//var $parentObj=$('.ui-layout-center');//$(window);
	//doch=parseInt($parentObj.height()); 
	if($(".chc_tabs").length>0){
		doch=parseInt($('.chc_tabs').parent().height());
		topdivh=parseInt(doch*TopBottomRate);
		tabsh=doch-topdivh;
		topGridHeight=topdivh-TopGridOtherBarHeight;
		bottomGridHeight=tabsh-TabsUlHeight-BottomGridOtherBarHeight;
		$(".chc_top_jqgrid").height(topdivh);
		$(".chc_tabs").height(tabsh); 
		numOfTopRow=Math.floor(topGridHeight/GridRowHeight);	 
		numOfBottomRow=Math.floor(bottomGridHeight/GridRowHeight);
	}else{
		if($(".chc_top_jqgrid").length>0){
			doch=parseInt($('.chc_top_jqgrid').parent().height());
			topdivh=doch;
			topGridHeight=topdivh-TopGridOtherBarHeight;
			$(".chc_top_jqgrid").height(topdivh);
			numOfTopRow=Math.floor(topGridHeight/GridRowHeight);
		}
	}
}

//列表刷新装载完成前事件，此处作权限及SESSION失效提示
//后面将没有权限、session失效等统一进行异常处理，zzm
function beforeProcessingFunc(data,st,xhr){ 
	//data就是xhr.responseText的json格式数据，  var res=$.parseJSON(xhr.responseText); 
	return authorization(data);
}

//根据请求返回数据检查，是否请求执行成功且具有访问权限
function authorization(data){
	if (data.hasOwnProperty("success")&&data["success"]){
		if (data.hasOwnProperty("access-denied")&&data["access-denied"]){
			var errorinfo=data.message;
			//？
    		if(data.cause=='AUTHORIZATION_FAILURE'){ 
    		}else if(data.cause=='AUTHORIZATION_NULL'){  
    		}
    		
    		//alert(errorinfo);
    		$.jgrid.info_dialog($.jgrid.errors.errcap,errorinfo,$.jgrid.edit.bClose,{modal:true});
    		return false;
		}
	}
	return true;
}

//编辑窗口弹出前
function editBeforeShowFormFunc(form,frmoper){  
	 var dlgDiv=form.closest(".ui-jqdialog");//$("#editmod"+$.jgrid.jqID(this.id));//  
	 var dlgWidth=dlgDiv.width();	 
	 var dlgHeight=dlgDiv.height();
	
	 var parentDiv=$(document);//dlgDiv.parent(); 	
	 var parentWidth=parentDiv.width();	
	 var parentHeight=parentDiv.height(); 	 
	  
	 dlgDiv[0].style.top=Math.round((parentHeight-dlgHeight)/2)+"px";	 
	 dlgDiv[0].style.left=Math.round((parentWidth-dlgWidth)/2)+"px";  
	 /*form.closest(".ui-jqdialog").position({
         of: window, // or any other element
         my: "center center",
         at: "center center"
     });*/ 
}	

// 也可在afterShowForm执行上面方法
//  afterShowForm: function($form) {
//    var dialog = $form.closest('div.ui-jqdialog'),
//        selRowId = myGrid.jqGrid('getGridParam', 'selrow'),
//        selRowCoordinates = $('#'+selRowId).offset();
//    dialog.offset(selRowCoordinates);
//}

//删除窗口弹出前	    
function delBeforeShowFormFunc(form){
  var dlgDiv=form.closest(".ui-jqdialog");//$("#delmod"+$.jgrid.jqID(this.id)); 	 //
	 var dlgWidth=dlgDiv.width();			 
	 var dlgHeight=dlgDiv.height();
	 var parentDiv=$(document);//dlgDiv.parent();
	 var parentWidth=parentDiv.width();
	 var parentHeight=parentDiv.height();  
	 dlgDiv[0].style.top=Math.round((parentHeight-dlgHeight)/2)+"px";
	 dlgDiv[0].style.left=Math.round((parentWidth-dlgWidth)/2)+"px"; 
} ;

//查询窗口弹出前	
function beforeShowSearchFunc(fbox){
	var listObjId=fbox[0].id.substring(5),
	 obj_fuzzysearch=$("#fuzzysearch_"+listObjId+"_top"),topPagerDiv=$('#'+listObjId+'_toppager')[0];
	//为清除模糊查询所用
	 if(obj_fuzzysearch.length>0){ 
		 if($("#fuzzysearch",topPagerDiv).val()!=''){ 
				//查询页面上table中除查询字段外，一开始有另外两个TR，查询字段是从第三个tr开始，用gt(1)表示序号(0,1,2,....)大于1
				var $tr=$("table.group tr:gt(1)",fbox);//取出全部查询字段
				for(var i=$tr.length+1;i>1;i--){ 
					//从最后一个查询字段开始一个一个触发删除键上的click事件将原先的条件清除
					$("table.group tr:eq("+i+") td:eq(4) input.delete-rule",fbox).trigger('click');
				}
				//重新产生一个默认空条件	
				$("table.group tr:eq(1) th input.add-rule",fbox).trigger('click');			 
		 }
	 } 
	 
	//var listObjId=$.jgrid.jqID(this.id),dlgDiv=$("#searchmodfbox_"+listObjId); 	////searchmodfbox_
	var dlgDiv=fbox.closest(".ui-jqdialog");
	 var dlgWidth=dlgDiv.width();			 
	// var dlgHeight=dlgDiv.height();
	 var parentDiv=$(document);//dlgDiv.parent();
	 var parentWidth=parentDiv.width();
	// var parentHeight=parentDiv.height(); 
	// dlgDiv[0].style.top=Math.round((parentHeight-dlgHeight)/2)+"px";
	 dlgDiv[0].style.left=Math.round((parentWidth-dlgWidth)/2)+"px";
	
	 return true;
}

//查询，点击查询按钮后执行刷新前事件
function onSearchFunc(filters){//filters为查询条件数据
	var listObjId=$.jgrid.jqID(this.id),obj_fuzzysearch=$("#fuzzysearch_"+listObjId+"_top");
	var topPagerDiv=$('#'+listObjId+'_toppager')[0];
	 if(obj_fuzzysearch.length>0){ 
		 if($("#fuzzysearch",topPagerDiv).val()!=''){ 
			 $("#fuzzysearch",topPagerDiv).val('');  
		 }
	 }
	 return true; 
}

//查询，点击重置按钮后执行刷新前事件
function onResetFunc(){
	var listObjId=$.jgrid.jqID(this.id),obj_fuzzysearch=$("#fuzzysearch_"+listObjId+"_top");
	var topPagerDiv=$('#'+listObjId+'_toppager')[0];
	 if(obj_fuzzysearch.length>0){ 
		 if($("#fuzzysearch",topPagerDiv).val()!=''){
			 $("#fuzzysearch",topPagerDiv).val('');  
		 }
	 }
	 return true; 
} 

/*
function editBeforeSubmitFunc(postdata,formid){	
	 if($('#noprocessor').val()==""){
		 $('#noprocessor').addClass("ui-state-highlight");
		 $('#refield').css("display","inline");
		 return[false,'processor:field is required'];
	 }
}*/

var iColWithError=[];//记录error栏位

//编辑页面前台验证,此处采用替换原方法，以实现将出错信息对应到相应栏位上
//保留checkValues值
var originalCheckValues = $.jgrid.checkValues;
//？
$.jgrid.checkValues = function(val, valref, customobject, nam){
	var ret=originalCheckValues.call(this,val,valref,customobject,name); 
	//$('.DataTD .ui-jqgrid-error-text').remove(); 
	for(var i=0;i<iColWithError.length;i++){
		$(iColWithError[i]).parent().find("label.ui-jqgrid-error-text").remove();    		
		$(iColWithError[i]).removeClass("ui-state-error"); 
	}
	if(!ret[0]){
		var checkfield=".DataTD #"+valref.replace(/\./g,"\\\.");  
		iColWithError[iColWithError.length++]=checkfield; 
		
		$(checkfield).parent().append("<label class='ui-jqgrid-error-text'>"+(ret[1].indexOf(": ")>=0?ret[1].split(":")[1]:ret[1])+"</label>"); 
		$(checkfield).addClass("ui-state-error");
		//$(checkfield).addClass("ui-state-highlight"); 
		$(checkfield).focus();
		ret[1]=$.jgrid.errors.errcap;
	}
	return ret;
};

//？
$.jgrid.checkValues_=function(val,valref,focusflag,customobject,nam){
	var ret=originalCheckValues.call(this,val,valref,customobject,name);  
	var checkfield=".DataTD #"+valref.replace(/\./g,"\\\.");  
	$(checkfield).parent().find("label.ui-jqgrid-error-text").remove();    		
	$(checkfield).removeClass("ui-state-error");  
	if(!ret[0]){ 
		iColWithError[iColWithError.length++]=checkfield;  
		$(checkfield).parent().append("<label class='ui-jqgrid-error-text'>"+(ret[1].indexOf(": ")>=0?ret[1].split(":")[1]:ret[1])+"</label>"); 
		$(checkfield).addClass("ui-state-error"); ; 
		if(focusflag) $(checkfield).focus();
		ret[1]=$.jgrid.errors.errcap;
	}
	return ret;
};

//编辑提交后事件 
function editAfterSubmitFunc(response,postdata,frmoper){
	$infoTr=$("#TblGrid_"+$.jgrid.jqID(this.id)+">tbody>tr.tinfo");
	$infoTd=$infoTr.children("td.topinfo");  	
	$errorTr=$("#TblGrid_"+$.jgrid.jqID(this.id)+">tbody>tr#FormError");
	$errorTd=$errorTr.children("td.ui-state-error");
	
	if($.trim(response.responseText).substr(0,6)=="<html>"){ //统一异常处理，这里以后可以去掉
		top.location="login";
	}else{
		var res=$.parseJSON(response.responseText);
		if(!authorization(res)) {
			$errorTd.hide(); //将编辑窗中的提示部分去掉（因为authorization已经会弹出提示），如果需要，将此句去掉
			return [false,res.message,""];    
		}
		for(var i=0;i<iColWithError.length;i++){			
    		$(iColWithError[i]).parent().find("label.ui-jqgrid-error-text").remove();    		
    		$(iColWithError[i]).removeClass("ui-state-error"); 
    	}
		if(res.success){ 
			var successinfo='<span class="ui-icon ui-icon-info" style="float:left;margin-right:.3em;"></span>'+res.message;
			$infoTd.html(successinfo); 
			$infoTr.show();
			getRecordIdAfterEdit(this.id, res, frmoper); 
			return [true, "", res.key_id]; 
	    }else{ 
	    	iColWithError=[];
		    var errorinfo=$.jgrid.errors.errcap;
		    if($.isArray(res.message)){ //判断是否为数组
			   	for(var i=0;i<res.message.length;i++){
			    	var checkfield=".DataTD #"+res.message[i].field.replace(/\./g,"\\\.");  
					iColWithError[iColWithError.length++]=checkfield;
					$(checkfield).parent().append("<label class='ui-jqgrid-error-text'>"+res.message[i]['defaultMessage']+"</label>"); //ret[1].split(":")[1]
					$(checkfield).addClass("ui-state-error"); 					
			    }
		    }else{
		    	errorinfo = res.message;
		    }
		    $errorTd.hide(); 
	        return [false, errorinfo, ""];  
    	}
	} 
 };
 
 function getRecordIdAfterEdit(objid,res){	
	 
 }
 
 //删除提交后事件
 function delAfterSubmitFunc(response,postdata,frmoper){
	$errorTr=$("#DelTbl_"+$.jgrid.jqID(this.id)+">table.DelTable>tbody>tr#DelError");
	$errorTd=$errorTr.children("td.ui-state-error");
	var res=$.parseJSON(response.responseText);
		
	if(!authorization(res)) {
		$errorTd.hide();
		return  [false,res.message,""];
	}
	if(res.success){ 
       return [true,"",res.key_id]; 
    }else{ 
       var errorinfo=res.message; 
       return [false,errorinfo,""];      
	} 
 }		
	 
//jgGrid功能按钮位置调整在上方
function jqGridButton(listObjId,paperObjId,flag){
	var topPagerDiv=$('#'+listObjId+'_toppager')[0];
	$("#"+listObjId+"_toppager_center",topPagerDiv).remove();
	$('#'+listObjId+'_toppager_left',topPagerDiv).parents(".ui-pg-table").css('table-layout','auto');
	if(flag){ 
		$(".ui-paging-info",topPagerDiv).remove();//right中内容删除  
		$('#'+listObjId+'_toppager_right',topPagerDiv).remove; 
	}else{ 
		//模糊查询
		function fsearch(searchvalue){
			var $list=$('#'+listObjId),
			columns=$.extend([],$list.jqGrid('getGridParam','colModel')),
			group={groupOp:"OR",rules:[],groups:[]},res=null,len=columns.length,cl,i;
			for(i=0;i<len;i++){
				cl=columns[i];
				if(cl.sorttype){cl.searchtype=cl.sorttype;}
				else if(!cl.searchtype){cl.searchtype='string';}
				if(cl.hidden===undefined){cl.hidden=false;}
				if(cl.index){cl.name=cl.index;}
				if(!cl.hasOwnProperty('searchoptions')){cl.searchoptions={};}
				//if(!cl.hasOwnProperty('searchrules')){cl.searchrules={};}
			}
			if(searchvalue==''){
				$list.setGridParam({search:false});
			}else{
				$.each(columns,function(i,n){ 
						var searchable=(n.search===undefined)?true:n.search,
						hidden=(n.hidden===true),
						ignoreHiding=(n.searchoptions&&n.searchoptions.searchhidden===true);
						if((ignoreHiding&&searchable)||(searchable&&!hidden)){ 
							var oper=$.inArray(n.searchtype,['text','string','blob'])!==-1?'cn':'eq';
						   	group.rules.push({
						   		field:n.name,op:oper,data:searchvalue
						   	});	 
						} 
				}); 
				try{
			   		res=xmlJsonClass.toJson(group,'','',false);//jqgrid自带此方法
			   	}catch(e){
			   		try{
			   			res=JSON.stringify(group);
			   		}catch(e2){}
			   	} 
				$list.setGridParam({search:true});
			}  
			//$("#fbox_"+listObjId).jqFilter('resetFilter');  
		   	$.extend($list.getGridParam('postData'),{filters:res});
		   	$list.trigger("reloadGrid",[{page:1}]);
		  // $.extend($list.getGridParam('postData'),{filters:null});//此句是为防止高级查询时将此值带入显示
		}
		var searchtable="<table class='ui-pg-table navtable' border='0' cellspacing='0' cellpadding='0' style='table-layout:auto;'>" +
		"<tr><td><input id='fuzzysearch' type='text' class='input-elm' size='20' role='textbox'></input></td>" +
		"<td id='fuzzysearch_"+listObjId+"_top' class='ui-pg-button ui-corner-all' title='"+$.fuzzysearch.title+"'>" +
		"<div class='ui-pg-div'><span class='ui-icon ui-icon-search'></span>"+$.fuzzysearch.bSearch+"</div></td>" +
		"</tr></table>";   
		$('#'+listObjId+'_toppager_right',topPagerDiv).html(searchtable).width(200).css('white-space',"pre").attr('align','center'); 
		$("#fuzzysearch_"+listObjId+"_top",topPagerDiv).hover(
					function(){$(this).addClass('ui-state-hover');},
					function(){$(this).removeClass('ui-state-hover');}
			 );	
		//回车键操作
		$("#fuzzysearch",topPagerDiv).keypress(function(e){
			 var key=e.charCode||e.keyCode||0;
			 if(key===13){
				 fsearch($(this).val());
				 return false;
			 }
			 return this;
		});
		//点击事件
		$("#fuzzysearch_"+listObjId+"_top",topPagerDiv).bind('click',function(){
			var searchvalue=$('#fuzzysearch',topPagerDiv).val();
			fsearch(searchvalue);
		}); 
	}  
	//刷新按钮覆盖，不清除条件等，原代码是清除条件
	$("#refresh_"+listObjId+"_top").unbind('click');
	$("#refresh_"+listObjId+"_top").click(function(){  
		$("#"+listObjId).trigger('reloadGrid');
	 });
	//底部是否有翻页条
	if(paperObjId!=null){
		var bottomPagerDiv=$("#"+paperObjId)[0];
		$("#add_"+listObjId,bottomPagerDiv).remove(); //add_toplist
		$("#edit_"+listObjId,bottomPagerDiv).remove(); //edit_toplist
		$("#search_"+listObjId,bottomPagerDiv).remove(); //search_toplist
		$("#del_"+listObjId,bottomPagerDiv).remove(); //del_toplist
		$("#refresh_"+listObjId,bottomPagerDiv).remove();
		$("#view_"+listObjId,bottomPagerDiv).remove(); 
	    $(".ui-separator",bottomPagerDiv).parent().remove();
	}
}

/*function refreshOverride(list){
	 var $thislist=$(list); 
	 var listObjId=$.jgrid.jqID(list.id);
	 
	 $("#refresh_"+listObjId+"_top").unbind('click');
	 $("#refresh_"+listObjId+"_top").click(function(){ 
		 $thislist.trigger('reloadGrid');
	 });
}*/

//页面大小改变,jqgrid作相应改变
function t_b_resize(parentObj){//,opts
	//{top:'toplist',bottom:'mxlist'}
	if(!jqmodal_jqgrid_init_flag){
		//var $parentObj=$('.ui-layout-center');//$(window);
		t_b_height_rownum();//重新计算
		// $(".ui-tabs").tabs( "option", "heightStyle", "fill" ); //会产生OVERFLOW:AUTO GOOGLE浏览器下会出现滚动条
		 
		var jqgridDivs=$('.ui-jqgrid',$('.chc_tabs'));
		 for(var i=0;i<jqgridDivs.length;i++){
			 var jqgridid=jqgridDivs[i].id.substring(5); //gbox_mxlist
			 
			 var i_opts_bottom=$("#"+jqgridid);
			 if(i_opts_bottom.length>0){
				 i_opts_bottom.jqGrid('setGridWidth',parentObj.width()-2);//$obj.width()-80
				 if(i_opts_bottom.jqGrid('getGridParam','pager')){//判断翻页Bar是否存在
					 i_opts_bottom.jqGrid('setGridHeight',bottomGridHeight);//tabsh-TabsUlHeight-BottomGridOtherBarHeight);
				 }else{
					 if(i_opts_bottom.jqGrid('getGridParam','toppager')){//判断工具Bar是否存在
						 i_opts_bottom.jqGrid('setGridHeight',bottomGridHeight+pagebarheight);
					 }else{
						 i_opts_bottom.jqGrid('setGridHeight',bottomGridHeight+pagebarheight*2);
					 }
				 }
				 //判断是否不翻页
				 if(i_opts_bottom.jqGrid('getGridParam','rowNum')!=-1&&!i_opts_bottom.jqGrid('getGridParam','treeGrid')) { 
					 i_opts_bottom.jqGrid('setGridParam',{rowNum:numOfBottomRow});//.trigger("reloadGrid");//top执行会带动明细执行
				 } 
			 }			 
		 }
		 
		 jqgridDivs=$('.ui-jqgrid',$('.chc_top_jqgrid'));
		 for(var i=0;i<jqgridDivs.length;i++){
			 var jqgridid=jqgridDivs[i].id.substring(5); //gbox_toplist
			 var i_opts_top=$("#"+jqgridid);
			 i_opts_top.jqGrid('setGridWidth',parentObj.width()-2);//$(window).width()-80
			 if(i_opts_top.jqGrid('getGridParam','pager')){
				 i_opts_top.jqGrid('setGridHeight',topGridHeight);//topdivh-TopGridOtherBarHeight);
			 }else{
				 if(i_opts_top.jqGrid('getGridParam','toppager')){
					 i_opts_top.jqGrid('setGridHeight',topGridHeight+pagebarheight);
				 }else{
					 i_opts_top.jqGrid('setGridHeight',topGridHeight+pagebarheight*2);
				 }
			 }	 
			 if(i_opts_top.jqGrid('getGridParam','rowNum')!=-1&&!i_opts_top.jqGrid('getGridParam','treeGrid')) {
				i_opts_top.jqGrid('setGridParam',{rowNum:numOfTopRow}).trigger("reloadGrid");	
			 }
		 }
		 
		 
//		 opts=$.extend(true,{top:'toplist',bottom:['mxlist']},opts||{}); 
//		 var opts_bottom=opts.bottom; 
//		 for(var i=0;i<opts_bottom.length;i++){
//			 var i_opts_bottom=$("#"+opts_bottom[i]);
//			 if(i_opts_bottom.length>0){
//				 i_opts_bottom.jqGrid('setGridWidth',parentObj.width()-2);//$obj.width()-80
//				 if(i_opts_bottom.jqGrid('getGridParam','pager')){//判断翻页Bar是否存在
//					 i_opts_bottom.jqGrid('setGridHeight',bottomGridHeight);//tabsh-TabsUlHeight-BottomGridOtherBarHeight);
//				 }else{
//					 if(i_opts_bottom.jqGrid('getGridParam','toppager')){//判断工具Bar是否存在
//						 i_opts_bottom.jqGrid('setGridHeight',bottomGridHeight+pagebarheight);
//					 }else{
//						 i_opts_bottom.jqGrid('setGridHeight',bottomGridHeight+pagebarheight*2);
//					 }
//				 }
//				 //判断是否不翻页
//				 if(i_opts_bottom.jqGrid('getGridParam','rowNum')!=-1&&!i_opts_bottom.jqGrid('getGridParam','treeGrid')) { 
//					 i_opts_bottom.jqGrid('setGridParam',{rowNum:numOfBottomRow});//.trigger("reloadGrid");//top执行会带动明细执行
//				 } 
//			 }
//		 } 
//		 var toplistobj=$("#"+opts.top); 
//		 if(toplistobj.length>0){
//			 toplistobj.jqGrid('setGridWidth',parentObj.width()-2);//$(window).width()-80
//			 toplistobj.jqGrid('setGridHeight',topGridHeight);//topdivh-TopGridOtherBarHeight);
//			 toplistobj.jqGrid('setGridParam',{rowNum:numOfTopRow}).trigger("reloadGrid");
//		 }	 
		 //关闭所有ui-jqdialog  
		 
		 //"#edithdmxlist"
		 $(".ui-jqdialog-titlebar-close :visible").trigger('click');    //ui-jqdialog-titlebar
		
	}
}

//字段关联通用选取，并产生选取按钮
function selCommon(fieldid,formobj,systemId,id,multiselecttype,keyElem, key, elems, fields,cnName, isShowSearchLayer, specialTable, specialAsTable){
	// $("#"+fieldid,formobj).attr('readonly','true');
	 //$("#"+fieldid,formobj).attr('disabled','true');
	 if($("#"+fieldid,formobj)){		 
		 if(systemId.indexOf("_")==0){
			 $("#"+fieldid,formobj).unbind("focus");
			 $("#"+fieldid,formobj).focus(
				function(){
					select_comm(fieldid,formobj,systemId.substring(1),id,multiselecttype,keyElem, key, elems, fields,cnName, isShowSearchLayer, specialTable, specialAsTable);
				}
			);
		 }else{  
			 $("#"+fieldid,formobj).after('<a id="tyselect_'+fieldid.replace(/\\/g,"")+'" href="#"  class="sel-button ui-state-default ui-corner-all" ><span class="ui-icon ui-icon-search" ></span></a>');//&nbsp;
			 $("#tyselect_"+fieldid).bind('click',function(){
				   select_comm(fieldid,formobj,systemId,id,multiselecttype,keyElem, key, elems, fields,cnName, isShowSearchLayer, specialTable, specialAsTable);
			 });
			 $("#tyselect_"+fieldid,formobj).hover(//.EditTable   .sel-button
					function(){$(this).addClass('ui-state-hover');},
					function(){$(this).removeClass('ui-state-hover');}
			 );
		 }
	 }
 }

//没有编辑页面（没有预先定义FORM）的通用选取
function _selCommon(objid,systemId,id,multiselecttype,fields,cnName, isShowSearchLayer, specialTable, specialAsTable){
	  $("#tySelForm").remove();	  
	  var tmpform=$("<form id='tySelForm'></form>"),arr_field=fields.split(","),elems='';
	  if((","+fields+",").indexOf(',id,')<0){
		  //如果fields中没有id，则加上id
		  arr_field.push("id");
	  }
	  for(var i=0;i<arr_field.length;i++){
		  var tmpinput=$("<input type='hidden' id='tySel_"+arr_field[i]+"' />");
		  tmpform.append(tmpinput);
		  if(arr_field[i]!='id'){
			  if(elems!='')elems=elems+',';
			  elems=elems+'tySel_'+arr_field[i].replace(/\./g,"\\\.");
		  }
	  }
	  $('#'+objid).append(tmpform);
	  
	  select_comm(objid,$('#tySelForm'),systemId,id,multiselecttype,'tySel_id','id',elems,fields,cnName,isShowSearchLayer, specialTable, specialAsTable);
}

//通用选取
function select_comm(fieldid,frmobj,systemId,id,multiselecttype,keyElem, key, elems, fields,cnName, isShowSearchLayer, specialTable, specialAsTable){
	//keyElem也可以多个字段作为主键 
	var seljqgrid="seljqgrid",seljqgridlistid=seljqgrid+"_list",seljqgridpagerid=seljqgrid+"_pager"; 
	var keyElemValues = new Array();
	var selCommElemValues= new Array();
	var arrKeyElems = keyElem.split(",");
	var arrSelCommElems = elems.split(",");
	var keyNames = key.split(",");
	var selCommFields = fields.split(",");
	//选择过的行将序号记入selected ,JSON格式，KEY为序号，value为true/false，后续判断时，因存在undefined，使用===true，即可
	var selected={};
	
	//根据form中原有值初始化数组
	//var keyhasvalue=false;//初始时，KEY中没有值，其他栏位有值，也看作没有值，则将相关注释去掉即可
	var i=0,tmp='';
	for(i=0;i<arrKeyElems.length;i++){
		keyElemValues[i] = new Array();
		tmp=$('#'+arrKeyElems[i],frmobj).val();//取edit页中相应key栏位的值
	    if(tmp!=''){
	    	keyElemValues[i] = tmp.split(","); 
	    	//keyhasvalue=true;
		}
	}   
	for(i=0;i<arrSelCommElems.length;i++){
		selCommElemValues[i] = new Array(); 
		tmp=$('#'+arrSelCommElems[i],frmobj).val();//取edit页中相应elems栏位的值
		if(tmp!=''){
			//if(keyhasvalue)
				selCommElemValues[i] = tmp.split(",");
		}
	}  
	//初始选中
	function initselected(){
		var rowIds=$(this).jqGrid('getDataIDs');//记录的序号
		 if(rowIds){
			 for(var x=0;x<rowIds.length;x++){
				 var rowData=$(this).jqGrid('getRowData',rowIds[x]);
				 for(var y=0;y<keyElemValues[0].length;y++){
					 var matchedFlag=0;
					 for (var i=0;i<keyNames.length;i++){ 
			 				if(rowData[keyNames[i]]==keyElemValues[i][y])
			 					matchedFlag++;
			 				else 
			 					matchedFlag=0;
			 				if(matchedFlag==0) break;
			 		 }
			 		if(matchedFlag>0) {
			 				 selected[rowIds[x]]=true;
			 				$(this).jqGrid('setSelection',rowIds[x],false);
			 				 break;
			 		 }
				 }
			 }
		 }
	}
	//赋值给父窗，并关闭当前窗
	function toParent(){ 
		for(var i=0;i<arrKeyElems.length;i++){
			$('#'+arrKeyElems[i],frmobj).val(keyElemValues[i].toString()); 
		}
		for(var i=0;i<arrSelCommElems.length;i++){ 
			$('#'+arrSelCommElems[i],frmobj).val(selCommElemValues[i].toString()); 
		}
		//$(".ui-icon-closethick", "#seljqgrid_head").trigger('click');  
		$("#closedialog", "#"+seljqgrid+"_id").trigger('click'); 
		try{
			//if($.isFunction(nextdo))  
			nextdo(fieldid,frmobj); 
		}catch(_){
			 
		}; 
	} 
	//选择行时执行的方法
	function select_element(objlist,rowid,status){
		//rowid不是数组，转一下，统一作为数组处理
		var arr=new Array();
		if($.isArray(rowid)){ 
			arr=rowid;
		}else{ 
			arr[0]=rowid; 
		} 
		//遍历数组，代替for循环，也可使用for循环
		$(arr).each(function(i,v){	//v是序号的值
			if(!multiselecttype) { 
				if(selected[rowid]===true){
					//单选时，如果当前条再点击，通过此句将高亮清除
					$(objlist.jqGrid('getGridRowById',rowid)).removeClass('ui-state-highlight').attr({'aria-selected':'false','tabindex':"-1"});
					//如果有锁定，也需要处理
					//if(objlist.frozenColumns===true){ 
					if(objlist.jqGrid('getGridParam','frozenColumns')===true){ 
						$("#"+rowid,"#"+seljqgridlistid+"_frozen").removeClass("ui-state-highlight");
					}
					objlist.setGridParam({selrow:null});//单选时，会比较原选中行和当前行是否相等
				}
				selected={};//单选时清空				
			}
			selected[v]=status;
			var rowData=objlist.getRowData(v); //$(this)为列表,此处得到v对应的行数据，json格式
			//var i_pos=-1; //防止有栏位被修改后，不能用新的值 ，则将相关注释去掉即可
			$(keyNames).each(function(j,n){ //n是字段名称
				if(multiselecttype){ 
					var isExists=$.inArray(rowData[n],keyElemValues[j]);//判断是否在数组中存在此值
					if(status){
						if(isExists==-1) {
							keyElemValues[j].push(rowData[n]);//true，且不存在此值时，加入
						}
					}else{
						 
						if(isExists>-1) {
							keyElemValues[j].splice(isExists,1);//false,且存在此值时，删除
							//i_pos=isExists;
						}
					}	
					
				}else{//单选时清空 
					keyElemValues[j]= new Array();
					if(status) keyElemValues[j].push(rowData[n]);
				}
		    }); 
			$(selCommFields).each(function(j,n){
				if(multiselecttype){ 
					var isExists=$.inArray(rowData[n],selCommElemValues[j]);
					if(status){
						if(isExists==-1) {
							selCommElemValues[j].push(rowData[n]);
						}
					}else{
						if(isExists>-1) {
							selCommElemValues[j].splice(isExists,1);
						}
						//else if(i_pos>-1) selCommElemValues[j].splice(i_pos,1);
					}
				}else{//单选时清空 
					selCommElemValues[j] = new Array(); 
					if(status) selCommElemValues[j].push(rowData[n]);
				}
			 }); 
		});
		
		//将选中记录数显示
		$("#countnum").html(keyElemValues[0].length);
		if(keyElemValues[0].length>0){ 
			$("#clearbutton").show();
		}else{
			$("#clearbutton").hide();
		}
	}
	
	function clearAlls(){  
		if(!confirm($.tysel.clearMsg)){
	    	return;
	    } 
		for(var i=0;i<keyElemValues.length;i++){
			keyElemValues[i] = new Array();
		}
		for(var i=0;i<selCommElemValues.length;i++){
			selCommElemValues[i] = new Array();
		}
		for(key in selected){
			selected[key]=false;
		}
		$('#'+seljqgridlistid).trigger('reloadGrid');
		/*
		 //用这种方法，只能清掉当前页的多选项
		 var ids=$("#"+seljqgridlistid).getDataIDs();
		 for(var i=0;i<ids.length;i++){ 
			 if(selected[ids[i]]===false)
				 $("#"+seljqgridlistid).jqGrid('setSelection',ids[i],false);
		 }*/
		$("#countnum").html(0);
		$("#clearbutton").hide(); 
	}
	
	var sel_div='<table id="'+seljqgridlistid+'" style="width:100%"><tr><td/></tr></table><div id="'+seljqgridpagerid+'"></div>'; 
	var buts=[{id:seljqgrid+'_ok_button',
				text:$.tysel.bSubmit,
				onClick:function(){
					toParent(); 
				}}]; 
 
	var other={msg:$.jgrid.format($.tysel.recordtext,"<b id='countnum' style='color:red'>"+keyElemValues[0].length+"</b>"),
			    buttons:[{text:$.tysel.bClear,//<a style='display:none' href='#implied'  >清空</a>
			    		 id:'clearbutton',
			    		 onClick:function(){clearAlls();}
			    }]
	};
	
	function createGrid(colnames,colmodel,objectname,listnames,ordername,ordertype,shrinktofit,objectWidth,objectHeight){
		var rownum=parseInt((objectHeight-16)/GridRowHeight); //16 
		 
		//请求产生数据并生成列表 
		$('#'+seljqgridlistid).jqGrid({
			url:'common/select/listdata',
			datatype:"json",mtype: "GET",  
			autowidth:false,
			width:objectWidth,
			height:objectHeight,//rownum*GridRowHeight+16,//objectHeight, 用 objectHeight会有误差间距，用计算出的行数再反计算高
			colNames:colnames, 
			colModel:colmodel, 
			toppager:false,
			cloneToTop:false,  
		    shrinkToFit:shrinktofit, 
		    rowNum:rownum, 
		    sortname:(ordername == null || ordername=='')?colmodel[0]['name']:ordername,
		    sortorder:(ordername == null || ordername=='')?"DESC":ordertype,
		    postData:{
		    	oldCndt:cnName,
		    	listNames:listnames,
		    	objectName:objectname
		    },
			pager:'#'+seljqgridpagerid,
			viewrecords: true,
			rownumbers: true,
			rownumWidth:25,
			multiselect:multiselecttype,//如果保留CHECKBOX，但是是单选 ,,则将此属性直接改成TRUE，然后根据multiselecttype值使用beforeSelectRow即可
			//multiboxonly:true, 
			prmNames: {rows:"size", sort:"sidx", order:"sord"},
			jsonReader:{ //server返回Json解析设定       
				repeatitems: false      
			},
			gridComplete:initselected, 
			ondblClickRow:function(rowIndex,col){ 
				toParent();
			},
			 
			//保留CHECKBOX，但是是单选 
			/* beforeSelectRow:function(rowid,e){
				 var td = e.target,scb = $(td).hasClass("cbox"),$this=this;
				 if(scb){   
					 var frz = $this.p.frozenColumns ? $this.p.id+"_frozen" : "";
					   $($this.p.selarrrow).each(function(i,n){ //单选时最多就两个，应该
						   if(n!=rowid){ 
							var trid = $($this).jqGrid('getGridRowById',n);
							$( trid ).removeClass("ui-state-highlight");
							//$(trid).removeClass("ui-state-highlight").attr("aria-selected","false");
							$("#jqg_"+$.jgrid.jqID($this.p.id)+"_"+$.jgrid.jqID(n))[$this.p.useProp ? 'prop': 'attr']("checked", false);
							//$this.p.selarrrow.splice(i,1);
							if(frz) {
								$("#"+$.jgrid.jqID(n), "#"+$.jgrid.jqID(frz)).removeClass("ui-state-highlight");
								$("#jqg_"+$.jgrid.jqID($this.p.id)+"_"+$.jgrid.jqID(n), "#"+$.jgrid.jqID(frz))[$this.p.useProp ? 'prop': 'attr']("checked", false);
							}
							$this.p.selarrrow.pop();
						   }
						});  
				 }else{
					 $(this).jqGrid('resetSelection');
					   this.p.selarrrow = [];
				 } 
				return(true);
			},*/
			onSelectRow:function(rowid,status){  
			//单击时执行
				select_element($(this),rowid,status); 
			},
			onSelectAll:function(rowids,status){
				//点击全选按钮时执行
				select_element($(this),rowids,status); 
			}
				
		}).navGrid('#'+seljqgridpagerid,{edit:false,add:false,del:false,search:true,refresh:true},{},{},{},{
			//查询窗口相关属性
			modal:true,multipleSearch:true,closeAfterSearch:true,showOnLoad:isShowSearchLayer!=null&& isShowSearchLayer!=""?true:false
		});  
		//jqGridButton(seljqgridlistid,seljqgridpagerid,1);
		//,frozen:true 
		//$("#"+seljqgridlistid).jqGrid("setFrozenColumns");在此锁定，会有问题，相关方法计算标题高度等值会为0,需放在afterOpen事件 
		 var dlgDiv=$("#"+seljqgrid+"_dialog");
		 var dlgWidth=dlgDiv.width();			 
		 var dlgHeight=dlgDiv.height();
		 var parentDiv=$(document); 
		 var parentWidth=parentDiv.width();
		 var parentHeight=parentDiv.height();  
		 dlgDiv[0].style.top=Math.round((parentHeight-dlgHeight)/2)+"px";
		 dlgDiv[0].style.left=Math.round((parentWidth-dlgWidth)/2)+"px";
	}
	
	//对话框产生前事件
	function selBeforeOpen(){  
		jqmodal_jqgrid_init_flag=true; 
		//请求产生jqgrid的列名称及相关发生参数
		var successflag=true;
		
		$.ajax({
			url:'common/select/object/'+systemId+'/'+id,
			dataType:'json',
			async:false,
			success:function(data){  
				if(!authorization(data)) {
					successflag=false;
					return;
				}
				
				var objectWidth=data.objectWidth;
				var objectHeight=data.objectHeight;
				if(objectWidth==null||objectWidth==''){
					objectWidth=600;
				}
				if(objectHeight==null||objectHeight==''){
					objectHeight=400;
				}
				var objectName=data.objectPyName;
				var objectAsName=data.objectAsName;
				if(specialTable!=null&& specialTable!=""){
					objectName=specialTable;
					objectAsName=specialAsTable;  
				}
				if(objectAsName != null && objectAsName!=""){
					objectName=objectName+" as "+objectAsName;
				} 
				var colnames=data.fieldLgName;
				var colmodel=[];
				var shrinktofit=true; 
				for (var i = 0; i < data.fieldPyName.length; i++) {
				    var fieldType = data.fieldType[i];
					var fieldName = data.fieldAsName[i];
					if (fieldName == null || fieldName=='') {
						fieldName = data.fieldPyName[i];
					}else{ 
						data.fieldPyName[i]=data.fieldPyName[i]+" "+fieldName;
					}
					var fieldWidth=data.fieldWidth[i];
					
					var j_cm={name:fieldName,index:fieldName,hidden:!data.isShow[i],search:data.isSearch[i]};
					if(fieldWidth!=null&&fieldWidth!=''){ 
						if(fieldWidth.indexOf('%')!=-1){
							j_cm['width']=fieldWidth.replace(/%/g, ""); 
						}else{
							j_cm['width']=fieldWidth;
							shrinktofit=false;
						} 
					} 
					if(fieldType=='char'){
						
					}else if(fieldType=='number'){
						j_cm['align']='right';
					}else if(fieldType=='date'){
						j_cm['formatter']='date';
						j_cm['align']='right';
					}else if(fieldType=='select'){
						j_cm['formatter']='select';
						j_cm['editoptions']={value:data.fieldValue[i]};
						j_cm['stype']='select';
						j_cm['searchoptions']={value:data.fieldValue[i]};//,sopt:['eq']
					}
					//frozen:true
					if(i==0) j_cm['frozen']=true;//锁定第一列
					colmodel.push(j_cm);
				}
				
				//修改标题
				$(".ui-jqdialog-title","#"+seljqgrid+"_dialog").html("<b>"+$.tysel.caption+" -- "+data.objectLgName+"</b>");//sel_head
				 
				createGrid(colnames,colmodel,objectName,data.fieldPyName,data.orderName,data.orderType,shrinktofit,objectWidth,objectHeight);				
			},
			error:function(xhr,st,err){
			//	alert(xhr.status+" "+err); 
				//alert(xhr.readyState+" "+xhr.status+" "+e.msg);
				if($.trim(xhr.responseText).substr(0,6)=="<html>"){
					//$('body').html(response.responseText);
					top.location="login";
				}else
					alert("Status:"+xhr.status+","+xhr.responseText); 
				successflag=false;
			}
		}); 
		return successflag;
	}
	//对话框产生后事件
	function selAfterOpen(){
		$("#"+seljqgridlistid).jqGrid("setFrozenColumns");
		if(keyElemValues[0].length>0){ 
			$("#clearbutton").show();
		}
	}
	//调用对话框
	sel_dialog($.tysel.caption,sel_div,$.tysel.bCancel,{buttonalign:'left',buttons:buts,other:other,beforeOpen:selBeforeOpen,afterOpen:selAfterOpen,idprefix:seljqgrid});//$.jgrid.edit.bClose
	
	jqmodal_jqgrid_init_flag=false; 
}

function nextdo(fieldid,frmobj){
	
}

//通用选取对话框
function sel_dialog(caption, content,c_b, modalopt) {
	var mopt = {
		width:'auto',
		height:'auto',
		dataheight: 'auto',
		drag: true,
		resize: false,
		left:250,
		top:170,
		zIndex : 1000,
		jqModal : true,
		modal : true,
		closeOnEscape : true,
		align: 'center',
		buttonalign : 'center',
		buttons : [],
		other:{msg:'',buttons:[]},
		idprefix:'sel'
	// {text:'textbutt', id:"buttid", onClick : function(){...}}
	// if the id is not provided we set it like sel_button_+ the index in the array - i.e sel_button_0,sel_button_1...
	};
	$.extend(true, mopt, $.jgrid.jqModal || {}, {caption:"<b>"+caption+"</b>"}, modalopt || {});
	var idprefix=mopt.idprefix;
	var jm = mopt.jqModal;
	if($.fn.jqm && !jm) { jm = false; }
	// in case there is no jqModal
	var buttstr ="", i;
	if(mopt.buttons.length > 0) {
		for(i=0;i<mopt.buttons.length;i++) {
			if(mopt.buttons[i].id === undefined) { mopt.buttons[i].id = idprefix+"_button_"+i; }
			buttstr += "<a id='"+mopt.buttons[i].id+"' class='fm-button ui-state-default ui-corner-all'>"+mopt.buttons[i].text+"</a>";
		}
	}
	//buttstr+="现有<b style='color:red'>"+keyElemValues[0].length+"</b>条记录被选取<a href='#implied' onClick='clearAll()'>清空</a>";
	var dh = isNaN(mopt.dataheight) ? mopt.dataheight : mopt.dataheight+"px",
	cn = "text-align:"+mopt.align+";";
	
	var v_c_b=c_b?"<a id='closedialog' class='fm-button ui-state-default ui-corner-all'>"+c_b+"</a>":""; 
	var v_otherbuttstr="";
	 
	if(mopt.other.buttons.length > 0) {
		for(i=0;i<mopt.other.buttons.length;i++) {
			v_otherbuttstr+="<a id='"+mopt.other.buttons[i].id+"' style='display:none' href='#implied' >"+mopt.other.buttons[i].text+"</a>";
		}
	}
	var v_othermsg=mopt.other.msg+v_otherbuttstr;
	var cnt = "<div id='"+idprefix+"_id'>";
	 
	
	cnt += "<div id='"+idprefix+"cnt' style='margin:0px;padding-bottom:0.3em;width:100%;overflow:auto;position:relative;height:"+dh+";"+cn+"'>"+content+"</div>";
	if(!(buttstr == ""&&v_c_b==""&&v_othermsg=="")){
		var ls_cnt="<div class='ui-widget-content ui-helper-clearfix' style='background-image: none;border-width:0;'>"
			+"<table class='EditTable' border='0' align='center' cellspacing='0' cellpadding='0'><tbody><tr>"
			+(v_othermsg==""?"":("<td class='navButton' style='text-align:left;'>"+v_othermsg+"</td>"))
			+"<td class='EditButton' style='text-align: "+mopt.buttonalign+";'>"+buttstr+v_c_b+"</td></tr></tbody></table>"
			+"</div>";
			cnt+=ls_cnt;
	}  
	//cnt += "<div id='"+idprefix+"cnt' style='margin:0px;padding-bottom:1em;width:100%;overflow:auto;position:relative;height:"+dh+";"+cn+"'>"+content+"</div>";
	//cnt +=(buttstr == ""&&v_c_b==""&&v_otherMsg=="")?"":"<div class='ui-widget-content ui-helper-clearfix' style='text-align:"+mopt.buttonalign+";padding-bottom:0.8em;padding-top:0.5em;background-image: none;border-width: 1px 0 0 0;'>"+v_otherMsg+buttstr+v_c_b+"</div>"; 
	//cnt += c_b ? "<div class='ui-widget-content ui-helper-clearfix' style='text-align:"+mopt.buttonalign+";padding-bottom:0.8em;padding-top:0.5em;background-image: none;border-width: 1px 0 0 0;'><a id='closedialog' class='fm-button ui-state-default ui-corner-all'>"+c_b+"</a>"+buttstr+"</div>" :
		//buttstr !== ""  ? "<div class='ui-widget-content ui-helper-clearfix' style='text-align:"+mopt.buttonalign+";padding-bottom:0.8em;padding-top:0.5em;background-image: none;border-width: 1px 0 0 0;'>"+buttstr+"</div>" : "";
	cnt += "</div>";

	try {
		if($("#"+idprefix+"_dialog").attr("aria-hidden") === "false") {
			$.jgrid.hideModal("#"+idprefix+"_dialog",{jqm:jm});
		}
		$("#"+idprefix+"_dialog").remove();//实际每次进入,都将之前清除,idprefix这个设了有点多余
	} catch (e){}
	$.jgrid.createModal({
		themodal:idprefix+'_dialog',
		modalhead:idprefix+'_head',
		modalcontent:idprefix+'_content',
		scrollelm: idprefix+'cnt'},
		cnt,
		mopt,
		'','',true
	);
	// attach onclick after inserting into the dom
	if(buttstr) {
		$.each(mopt.buttons,function(i){
			$("#"+$.jgrid.jqID(this.id),"#"+idprefix+"_id").bind('click',function(){mopt.buttons[i].onClick.call($("#"+idprefix+"_dialog")); return false;});
		});
	}
	if(v_otherbuttstr){
		$.each(mopt.other.buttons,function(i){
			$("#"+$.jgrid.jqID(this.id),"#"+idprefix+"_id").bind('click',function(){mopt.other.buttons[i].onClick.call($("#"+idprefix+"_dialog")); return false;});
		});
	}
	$("#closedialog", "#"+idprefix+"_id").click(function(){
		$.jgrid.hideModal("#"+idprefix+"_dialog",{
			jqm:jm,
			onClose: $("#"+idprefix+"_dialog").data("onClose") || mopt.onClose,
			gb: $("#"+idprefix+"_dialog").data("gbox") || mopt.gbox
		});
		return false;
	});
	$(".fm-button","#"+idprefix+"_dialog").hover(
		function(){$(this).addClass('ui-state-hover');},
		function(){$(this).removeClass('ui-state-hover');}
	);
	var beforeopenflag=true;//打开窗口前事件中，如AJAX请求异常时，不需要打开弹出窗口
	if($.isFunction(mopt.beforeOpen) ) { 
		beforeopenflag=mopt.beforeOpen(); 
	}
	if(beforeopenflag){
		$.jgrid.viewModal("#"+idprefix+"_dialog",{
			onHide: function(h) {
				h.w.hide().remove();
				if(h.o) { h.o.remove(); }
			},
			modal :mopt.modal,
			jqm:jm
		});
		if($.isFunction(mopt.afterOpen) ) { mopt.afterOpen(); }
		try{ $("#"+idprefix+"_dialog").focus();} catch (m){}
	}
}

/*
function datetimeCommon(fieldid,frmobj,ops,dtflag){  
	var vops=$.extend({showOn:'focus',dtflag:'d',dateFormat:'yy-mm-dd'},ops||{});
	if(dtflag!==undefined) vops.dtflag=dtflag;
	 
	if(vops.dtflag=='d')
		$('#'+fieldid,frmobj).datepicker(vops); 
	else if(vops.dtflag=='t')
		$('#'+fieldid,frmobj).timepicker(vops);
	else if(vops.dtflag=='dt')
		$('#'+fieldid,frmobj).datetimepicker(vops);
	if(vops.showOn!='focus'){ 
		$('#'+fieldid,frmobj).next('button').text('').button({icons:{primary:'ui-icon-calendar'},text:false}).removeClass('ui-button ui-button-icon-only').addClass('sel-button');
 	}
}*/

//开关按钮
function btn_switch(p){
	//listobj ,btnid, fieldvalue,switchvalue,caption,title
 
	  p=$.extend({listobj:$(this),switchvalue:null,title:null},p);
	  //取出解锁加锁功能按钮ID
	  if(p.title==null) p.title=p.caption;
	  
	  if(p.switchvalue==null) {
		  if(p.fieldvalue=='true'||p.fieldvalue==true||p.fieldvalue==1||p.fieldvalue=='1'||p.fieldvalue=='Y'||p.fieldvalue=='y')
			  p.fieldvalue=true;
		  else //if(p.fieldvalue=='false'||p.fieldvalue==false||p.fieldvalue==0||p.fieldvalue=='0'||p.fieldvalue=='N'||p.fieldvalue=='n'||p.fieldvalue==''||p.fieldvalue==null)
			  p.fieldvalue=false; 
		  p.switchvalue=[true,false];		   
	  }
	   
	  var objdiv=$(".ui-pg-div","#"+p.btnid);
	  //取出objdiv所有子元素，但不包括文本,以下两种方法都可以
    //var objspan= $(".ui-pg-div",$("#"+p.btnid)).find("span.ui-icon");//如果功能按钮没有图标此方法适合
	  
    var objspan = objdiv.children();
    objdiv.html(objspan);//再放入，已经不含文字
     
    for(var i=0;i<p.switchvalue.length;i++){
    	if(p.fieldvalue==p.switchvalue[i]){
    		objdiv.append(p.caption[i]);
    		$("#"+p.btnid).prop('title',p.title[i]);
    		break;
    	}
    } 
}

//弹出窗口并带树型可勾选
function dialog_treegrid(opt){
	var idprefix='d_t_g';
	opt = $.extend({
		 title:'',		 
		 url:null,
		 submiturl:null,
		 colNames:null,
		 colModel:null,
		 submitparam:'id',
		 ExpandColumn:null,
		 gridid:idprefix+'_list', 
		 beforeRowEdit:null,
		 oneditfunc:null,
		 afterSubmit:null
	}, opt || {}); 
	 var d_t_g_table='<table id="'+idprefix+'_list" style="width:100%"><tr><td/></tr></table>'; 
	 var buts=[{id:idprefix+'_ok_button',
			text:$.tysel.bSubmit,
			onClick:function(){ 
				var rowids=$("#"+idprefix+"_list").jqGrid('getDataIDs'),l=rowids.length; 				 
				var params={}; 
				 
				if($.isFunction(opt.submitparam))	
					opt.submitparam.call($("#"+idprefix+"_list"),rowids,params);
				else{
					var submitcol=opt.submitparam.split(",");
					for(var i=0;i<l;i++){
						//alert($('#'+rowids[1]+'_enbl').val());//永远都是1，只能通过checked来判断
						if($('#'+rowids[i]+'_enbl').is(':checked')&&$('#'+rowids[i]+'_isLeaf').val()=='true'){
						 
							for(var j=0;j<submitcol.length;j++){
								//if(j>0) params[submitcol[j]]=params[submitcol[j]]+",";
								//params[submitcol[j]]=$('#'+rowids[i]+'_'+submitcol[j]).val();
								if(params[submitcol[j]]){ 
								}else	params[submitcol[j]]=[];
								
								if(submitcol[j]=='id') params[submitcol[j]].push(rowids[i]);
								else params[submitcol[j]].push($('#'+rowids[i]+'_'+submitcol[j]).val()); 
							}
						}
					}
				}
				
				//if($.isEmptyObject(params)) {
				//	alert("没有勾选");
				//	return;
				//}
				
				 
				$.ajax({
					url:opt.submiturl,
					data:params,
					dataType:'json',
					type: "POST",									
					async:false,
					success:function(data){ 
						 if(!authorization(data)) { 
							return;
						}  
						 if(data.success){	
							  //重新刷新详细信息
	    					 //$("#mxlist").jqGrid('setGridParam').trigger('reloadGrid');
							 if(opt.afterSubmit!=null) opt.afterSubmit.call($("#"+idprefix+"_list"));
	    					 //如果sel_dialog不设idprefix,则默认为sel,则为sel_id
							  $("#closedialog", "#"+idprefix+"_id").trigger('click');	
							  //实际这个也可	  $("#d_t_g_dialog").remove();// $("#sel_dialog").remove();
						 } 
					},
					error:function(xhr,st,err){ 
					 		alert("Status:"+xhr.status+","+xhr.responseText);  
					}
				}); 
				}}];
	 var other={msg:"<input type='checkbox' id='"+idprefix+"_selectall' />全选"};
	 
	 function dialog_treegridBeforeOpen(){		 
		 treegrid_enbl(opt);
		 $('#'+idprefix+'_selectall').change(function(){
			 var treegrid_rowdatas=$('#'+opt.gridid).prop("treegrid_rowdatas");
			 for(key in treegrid_rowdatas){	  
				treegrid_rowdatas[key].childSelectedCount=this.checked?treegrid_rowdatas[key].childCount:0; 
				$('#'+key+'_enbl').prop("checked",this.checked);				
			 }
		 });
		 var dlgDiv=$("#"+idprefix+"_dialog");
		 var dlgWidth=dlgDiv.width();			 
		 var dlgHeight=dlgDiv.height();
		 var parentDiv=$(document); 
		 var parentWidth=parentDiv.width();
		 var parentHeight=parentDiv.height();  
		 dlgDiv[0].style.top=Math.round((parentHeight-dlgHeight)/2)+"px";
		 dlgDiv[0].style.left=Math.round((parentWidth-dlgWidth)/2)+"px";	
		 return true;
	 }
	 
	 sel_dialog(opt.title,d_t_g_table,$.tysel.bCancel,{buttonalign:'right',buttons:buts,other:other,beforeOpen:dialog_treegridBeforeOpen,idprefix:idprefix});
}

//jgrid树型 ,多行编辑，带checkbox
function treegrid_enbl(opt){
	//oneditfunc传
	opt = $.extend({
			 url:null,
			 colNames:null,
			 colModel:null,
			 ExpandColumn:null,
			 gridid:'treegrid_list',
			 beforeRowEdit:null,
			 oneditfunc:null
		}, opt || {}); 
	 $("#"+opt.gridid).prop("treegrid_rowdatas",{});
	 $("#"+opt.gridid).jqGrid({ 
			 url:opt.url ,
				datatype:'json',treedatatype:'json',  
				colNames:opt.colNames,
				colModel:opt.colModel, 
				height:bottomGridHeight+pagebarheight*2,//pager不显示，需加上26,     
				rowNum:-1,//numOfBottomRow, //每页记录数 
				pager:false, //分页标签divID   
				treeGrid:true,
				treeGridModel:"adjacency",
				ExpandColumn:opt.ExpandColumn,
				ExpandColClick:true, 
				rownumbers:false,
				toppager:false,
				cloneToTop:false,
				loadComplete:function(){
					var $this=$(this),ids=$this.jqGrid('getDataIDs'),i,l=ids.length,treegrid_rowdatas=$this.prop("treegrid_rowdatas");
					 
					//进行行编辑设置
					var tempLeafParent="";//用作叶子节点父节点是否相同
					for(i=0;i<l;i++){  
						var rowdata=$this.jqGrid('getRowData',ids[i]); 
						 
						var onBeforeRowEdit = $.isFunction(opt.beforeRowEdit) ?opt.beforeRowEdit : false;
						if(onBeforeRowEdit)	onBeforeRowEdit.call(this,ids[i],rowdata);	
						//对于部分行中某些栏位需不需要编辑进行重设置
						
						 
						rowdata.childCount=0;
						rowdata.childSelectedCount=0;

						var pid=rowdata.parent;
						if(pid!='') { 
							treegrid_rowdatas[pid].childCount++;
							//考虑后台父节点的enbl值设置的不正确 ，重新根据叶子节点生成父节点的childSelectedCount
							treegrid_rowdatas[pid].childSelectedCount++; 
							
							if(rowdata.isLeaf=='true') {  
								if(tempLeafParent!=pid){
									$('#'+pid+'_enbl').prop("checked",true);//首次设为勾选，后续如果有子节点没有勾选，会将此勾选去掉
									tempLeafParent=pid;
								} 
								if(rowdata.enbl!='1'){ 
									var flag=0;//叶子节点每次都减，但父节点就只能减一次
									while(pid!=''&&flag==0){//$('#'+pid+'_enbl').is(':checked')  
										if(treegrid_rowdatas[pid].childSelectedCount!=treegrid_rowdatas[pid].childCount){
											flag=1;
										}
										treegrid_rowdatas[pid].childSelectedCount--;
										$('#'+pid+'_enbl').prop("checked",false);
										pid=treegrid_rowdatas[pid].parent; 
									} 
								} 
							}
							else{
								if(treegrid_rowdatas[pid].childSelectedCount==treegrid_rowdatas[pid].childCount)
								$('#'+pid+'_enbl').prop("checked",true);
								//$('#'+rowdata.id+'_enbl').prop("checked",true); //当前rowdata.id的CHECKED还没有产生，editrow在后面才进行
							}
							//如果后台有父节的enbl正确值，用下面代码即可
							//if(rowdata.enbl=='1')
							//	treegrid_rowdatas[rowdata.parent].childSelectedCount++;
						} 										
						treegrid_rowdatas[rowdata.id]=rowdata;

						//将行设定编辑状态
						$this.jqGrid('editRow',ids[i],true,opt.oneditfunc); 
						//本身有一个接口，beforeEditRow，好像是需要function(rowid,keys,oneditfunc,successfunc, url, extraparam, aftersavefunc,errorfunc, afterrestorefunc)最后，自己加
						//此处没用，是上面自己处理了

                        //给checkbox设定事件 
						$('#'+rowdata.id+'_enbl').change(treegrid_enbl_changefunction);
					} 
					//this.rows[1]
					//setTimeout(function(){$("td:eq(1) input",$this.jqGrid("getInd",ids[0],true)).focus();},0);					 
					setTimeout(function(){$("#"+ids[0]+"_enbl",$this.jqGrid("getInd",ids[0],true)).focus();},0);
					
				}
	 });  
}

//jgrid树型 编辑状态时,enbl(checkbox) change事件
function treegrid_enbl_changefunction(e){ 
	var gviewid= $(e.target).closest("div[id^='gview_']")[0].id,gridid=gviewid.substring(6);//authlist
	 
	var treegrid_rowdatas=$("#"+gridid).prop("treegrid_rowdatas");
	var id = $(e.target).closest('tr')[0].id,isChecked = $(e.target).is(':checked');
	var rowd=treegrid_rowdatas[id],parentid;
	var whileArr=new Array;//定义一数组，将有子节点的节点存入  
	if(rowd.isLeaf!='true'){
		whileArr.push(id); 
		rowd.childSelectedCount=isChecked?rowd.childCount:0;
	}	
	
	//对父节点checkbox操作
	if(isChecked){ 
		while(rowd.parent!=''){									
			parentid=rowd.parent;
			rowd=treegrid_rowdatas[parentid]; 
            rowd.childSelectedCount++;
            //字节点选择数与字节点选择数相同，则将此节点勾选上，并继续找父节点作判断，否则退出循环不再找父节点
            
            if(rowd.childSelectedCount==rowd.childCount)  
                $('#'+parentid+'_enbl').prop("checked",isChecked); 
            else  break;		                            
		} 
    }else{ 
    	while(rowd.parent!=''){
    		parentid=rowd.parent;
			rowd=treegrid_rowdatas[parentid];  
       		rowd.childSelectedCount--;
         	 if($('#'+parentid+'_enbl').prop("checked")==isChecked) break;
         	 else  $('#'+parentid+'_enbl').prop("checked",isChecked);
    	} 
    } 
	 
	//对有子节点的节点操作  
	 for(var k=0;k<whileArr.length;k++){ 
		 for(var key in treegrid_rowdatas){
			 rowd=treegrid_rowdatas[key];
			 if(rowd.parent==whileArr[k]){ 
				 $('#'+key+'_enbl').prop("checked",isChecked);										 
				 if(rowd.isLeaf!='true'){ 
				 	whileArr.push(key);
				 	rowd.childSelectedCount=isChecked?rowd.childCount:0;
				 }   									 									  
			 } 
		 }  
	 } 
}

//编辑服务端异常
function editErrorFunc(data){
	// alert(JSON.stringify(data));
	if(data.responseText.substr(0,6)=="<html>"){
	  //alert(data.responseText);
	  return $(data.responseText).html();
	}else{   
	  return $.jgrid.format($.errortext.jqgridediterror,data.statusText,data.status);
	}
} 

//列表载入异常
function loadErrorFunc(xhr,status,error){ 
	var errortext=$.jgrid.format($.errortext.jqgridloaderror,status,$(this).attr("id"),error);
	alert(errortext);
    //$.jgrid.info_dialog($.jgrid.errors.errcap,errortext,$.jgrid.edit.bClose,{zIndex:1500,onClose:function(){return true;}});
}

//tab载入异常 
function tabBeforeLoad(event,ui){ 
	ui.jqXHR.error(function(){
    	ui.panel.html($.errortext.tabloaderror);
    });				
}

//$.datepicker.setDefaults({
//	showOn:"button",
//	buttonImageOnly:true,
//	buttonImage:"../resources/image/calendar.gif",
//	buttonText:"日期选取"
//	}); 
//判断是否为数组jquery 有相应方法$.isArray(obj) 
//function isArray(obj){
//	//return obj instanceof Array;//在IFRAME中创建的Array并不共享prototype
//	//1.8.5中 Array.isArray(obj)
//	return Object.prototype.toString.call(obj)==='[object Array]';//也有问题 
//}

//可以设置覆盖jqGrid的全局参数
$.extend($.jgrid.defaults, { 
	datatype:"local",mtype: "GET", 
	autowidth:true,  //$(window).width()-2  
	viewrecords: true, //显示记录数信息，如果这里设置为false,下面的不会显示 recordtext: "第{0}到{1}条, 共{2}条记录", //默认显示为{0}-{1} 共{2}条 scroll: false, //滚动翻页，设置为true时翻页栏将不显示      
	 /**这里是排序的默认设置，这些值会根据列表header点击排序时覆盖*/ 	          
	//caption:"明细项", //显示查询结果表格标题        
	rownumbers: true, //设置列表显示序号,需要注意在colModel中不能使用rn作为index        
	rownumWidth: 20, //设置显示序号的宽度，默认为25     	
	toppager:true,//默认顶部功能Bar显示
	cloneToTop:true,  //通过克隆到顶部
	scrollrows:true,//为记录定位准备
	//postData:{gotoID:goto_ddmxid},
	jsonReader:{ //server返回Json解析设定       
		repeatitems: false     
	}, 
	loadError:loadErrorFunc 
	,beforeProcessing:beforeProcessingFunc
	 });  

$.extend($.jgrid.edit,{
	modal:true,viewPagerButtons:false,closeOnEscape:true,recreateForm:true,closeAfterEdit:true,closeAfterAdd:true,
	beforeShowForm:editBeforeShowFormFunc,
	afterSubmit:editAfterSubmitFunc,
	errorTextFormat:editErrorFunc,
	onClose:function(){ 
	  }	
});

$.extend($.jgrid.del,{
    mtype:'DELETE',
	errorTextFormat:editErrorFunc,
	beforeShowForm:delBeforeShowFormFunc,
	afterSubmit:delAfterSubmitFunc
});

$.extend($.jgrid.search,{
	multipleSearch:true,closeAfterSearch:true//,loadDefaults:false // ,recreateFilter:true //类似recreateForm:true
	,beforeShowSearch:beforeShowSearchFunc
	,onSearch:onSearchFunc,onReset:onResetFunc
});

$.extend($.jgrid.nav,{
	cloneToTop:true //功能Bar克隆到顶需设置此属性
	});

//shrinkToFit：默认值为true。 
//如果shrinkToFit为true且设置了width值，则每列宽度会根据width成比例缩放； 
//如果shrinkToFit为false且设置了width值，则每列的宽度不会成比例缩放，而是保持原有设置，而Grid将会有水平滚动条。 
//mtype:'PUT',
// ajaxEditOptions:{contentType:"application/json"},
// serializeEditData:function(data){  
//     delete data.oper;                  
//     return JSON.stringify(data);
//     }, 

//*********************************************//

//密码验证 
function rule_yhkl(value,colname,valref){	 
 	var s_level=checkStrong(value); 	
	if(s_level>2){
		return [true,""];   
	}else{ 
		//密码强度不够
		return [false,$.jgrid.edit.msg.passwordStrength];     
	}	
 }
	
 function rule_qryhkl(value,colname,valref){
	var cm=this.p.colModel,kl1=$("#"+cm[valref-1].name).val(),kl2=value,prev_colname='';	//kl1=$("#yhkl").val()
	 if(cm[valref-1].formoptions != null) { prev_colname = cm[valref-1].formoptions.label; }  
	 if(prev_colname=='') { 
		 prev_colname = this.p.colNames != null ? this.p.colNames[valref-1] : cm[valref-1].label; 
	 } 
	if(kl1==kl2){ 
		return [true,""];  
	}else{ 
		//用户密码和确认密码不一致
		return [false,$.jgrid.format($.jgrid.edit.msg.passwordConfirm,prev_colname,colname)];  
	}	
 }

 //source:www.web2bar.cn  
 //测试某个字符是属于哪一类.  
 function CharMode(iN){  
 	if (iN>=48 && iN <=57) //数字  
		return 1;  
	if (iN>=65 && iN <=90) //大写字母  
		return 2;  
	if (iN>=97 && iN <=122) //小写字母  
		return 4;  
	else  
		return 8; //特殊字符  
 }  

 //计算出当前密码当中一共有多少种模式  
 function bitTotal(num){  
	 modes=0;  
	for (var i=0;i<4;i++){  
		if (num & 1) modes++;  
		num>>>=1;  
	}  
	return modes;  
 }  

 //返回密码的强度级别  
 function checkStrong(sPW){  
	if (sPW.length<6)  
		return 0; //密码太短  
	Modes=0;  
	for (var i=0;i<sPW.length;i++){  
		//测试每一个字符的类别并统计一共有多少种模式.  
		Modes|=CharMode(sPW.charCodeAt(i));  
	}  
	return bitTotal(Modes);  
 }  
 //密码验证结束
//***********************
 
(function($) {
	  //日期时间控件
	  $.fn.datetimeCommon = function(options) { 
		 var settings = $.extend({}, {showOn:'focus',dtflag:'d',dateFormat:'yy-mm-dd'}, options); 
	    return this.each(function() { 
	    	if(settings.dtflag=='d')
	    		$(this).datepicker(settings); 
	    	else if(settings.dtflag=='t')
	    		$(this).timepicker(settings);
	    	else if(settings.dtflag=='dt')
	    		$(this).datetimepicker(settings);
	    	if(settings.showOn!='focus'){ 
	    		/*源代码createEl
	    		 * if(autowidth) {
						if(!options.size) { $(elem).css({width:"98%"}); }
					} else if (!options.size) { options.size = 20; }
					*/
	    		if(!$(this).parent().hasClass('DataTD')){
	    			//如果是查询
	    		 	if($(this).prop('size')==20){
		    			$(this).width('80%');
		    		}
	    		}
	    		$(this).next('button').text('').button({icons:{primary:'ui-icon-calendar'},text:false}).removeClass('ui-button ui-button-icon-only').addClass('sel-button');
	     	}
	    }); 
	  };
	  //通用选取
	  $.fn.selCommon=function(systemId,id,multiselecttype,keyElem, key, elems,fields,cnName, isShowSearchLayer, specialTable, specialAsTable){
		  return this.each(function(){ 
			  
			  var thisid=$(this)[0].id; 
			  thisid=thisid.replace(/\./g,"\\\.");
			 // alert(thisid);
			 // alert($(this).closest('form')[0].id);
			  selCommon(thisid,$(this).closest('form'),systemId,id,multiselecttype,keyElem, key, elems, fields,cnName, isShowSearchLayer, specialTable, specialAsTable);
		  });
	  };
	  //查询时通用选取
	  $.fn.searchSelCommon=function(systemId,id,multiselecttype,fields,cnName, isShowSearchLayer, specialTable, specialAsTable){
		  return this.each(function(){ 
			  var thisid=$(this)[0].id; 
			  thisid=thisid.replace(/\./g,"\\\.");
			  if($(this).prop('size')==20){
	    			$(this).width('80%');
	    	   }
			  $(this).after("<input type='hidden' id='"+thisid+"id'>");
			  selCommon(thisid,$(this).closest('.searchFilter'),systemId,id,multiselecttype,thisid+'id','id',thisid,fields,cnName,isShowSearchLayer, specialTable, specialAsTable);		
		  });
	  };
	  
	  //没有编辑页面（没有预先定义FORM）的通用选取
	  $.fn._selCommon=function(systemId,id,multiselecttype,fields,cnName, isShowSearchLayer, specialTable, specialAsTable){
		  return this.each(function(){
			   
			  var thisid=$(this)[0].id; 
			  thisid=thisid.replace(/\./g,"\\\.");
			  
			  _selCommon(thisid,systemId,id,multiselecttype,fields,cnName, isShowSearchLayer, specialTable, specialAsTable);
			 
		  });
	  };
	})(jQuery);