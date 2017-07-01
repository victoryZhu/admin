<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%> 
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags"%>  

<link type="text/css" rel="stylesheet" href="<c:url value="/resources/css/zTreeStyle/zTreeStyle.css" />" /> 
<script type="text/javascript" src="<c:url value="/resources/js/jquery.ztree.all-3.5.js" />"></script>

<!-- 设置编辑权限变量值 -->
<c:set value="" var="editFlag" ></c:set>
<sec:authorize access="hasRole('ROLE_ADMIN')">
	<c:set value="true" var="editFlag" ></c:set>    
</sec:authorize>

<script type="text/javascript"> 
var proPath='<c:url value="/security/roleright/jsqx/" />';
var cur_roleid="";//主档当前ID

function showJsqx(){
	var zTreeObj;
	var setting = {		   
			   data: {
				   simpleData: {
					   enable: true,
					   idKey: "id",
					   pIdKey: "pId",
					   rootPId: 0
				   }
			   }			   
		};
	$.ajax({
	   url:proPath+cur_roleid,  
       type: 'GET',
       dataType:'json',
	   //async:false,
       success: function (data) {    	   
	       //if(data==="[]"){	    	   
		       //alert("没有权限！");	
	       //}else{
	    	   zTreeObj = $.fn.zTree.init($("#tree"), setting, data);
	    	   zTreeObj.expandAll(true);
	       //}
       },
       error:function(xhr,st,err){            
           if($.trim(xhr.responseText).substr(0,6)=="<html>"){
               alert(xhr.responseText);    					
   		   }else
   			   alert("Status:"+xhr.status+","+xhr.responseText);   
   		   dragAsyncFlag=false;
       }
   });	
}

//在jquery.jgGrid.custom.js中调用
function getRecordIdAfterEdit(objid, res){ 
	//objid为jqGrid列表的id，res为后台返回的JSON数据		
}

//编辑Form产生前初始函数
 function onInitializeFormfunc(formobj,frmoper){  
	 
 }
 
 //编辑Form产生后函数
 function editAfterShowFormFunc(formobj,frmoper){

 }
 
 //在通用选取后执行，新增角色成员调用通用选取得到对应的id，再通过ajax执行提交请求
 function nextdo(fieldid, formobj){  
	var params = {'roleId':cur_roleid}, url='', refreshid='';		
	if(fieldid == 'tabs-2') {
		params['ryxxIds'] = $('#tySel_id',formobj).val();
		url='<c:url value="/security/roleright/roleryxxs" />';
		refreshid='ryxxlist';
	}

	$.ajax({
		url:url, 
		data:params,
		dataType:'json',
		type: "POST",									
		async:false,
		success:function(data){ 			
			if(!authorization(data)) { 
				return;
			}  
			if(data.success){
				$("#"+refreshid).trigger('reloadGrid');									 
			} 
		},
		error:function(xhr,st,err){ 
			alert("Status:"+xhr.status+","+xhr.responseText);  
		}
	}); 		 
 }	 
 
 $(function(){ 
	 //调整上下帧高度及GRID的行数，在jquery.jgGrid.custom.js中实现
	 t_b_height_rownum(); 

	 //角色成员grid定义			    		 
	 $("#ryxxlist").jqGrid({  
		 colNames:['','','','部门编号','部门名称','人员编号','姓名'], //表头
		 colModel:[ //这里会根据index去解析jsonReader中root对象的属性，填充cell
		   		 {name:'id', index:'id', hidden:true, editable:true},       
			     {name:'role.id', index:'role.id', hidden:true, editable:true, viewable:false},			         
			     {name:'ryxx.id', index:'ryxx.id', hidden:true, editable:true, viewable:false},  
			     {name:'ryxx.bmxx.bmbh', index:'ryxx.bmxx.bmbh', width:150, align:"center", sortable:true},  
			     {name:'ryxx.bmxx.bmmc', index:'ryxx.bmxx.bmmc', width:150, align:"center", sortable:true},
			     {name:'ryxx.rybh', index:'ryxx.rybh', width:60,align:"center", sortable:true},			       	 
			     {name:'ryxx.name', index:'ryxx.name', width:50,align:"center", editrules:{required:true}, formoptions:{elmsuffix:'<font color=red> *</font>'},
				       	 editable:true, edittype:'text', editoptions:{size:20}}
			     ],
		 height: bottomGridHeight, //下帧高度
		 rowNum: numOfBottomRow, //每页记录数
		 pager: '#ryxxpager', //分页标签divID  
		 sortname: "id",
		 sortorder: "desc", 
		 multiselect: true, //多选框        
		 multiboxonly: true, //在点击表格row时只支持单选，只有当点击checkbox时才多选，需要multiselect=true是有效   
		 prmNames: {rows:"size", sort:"sidx", order:"sord"},  //适应controller中Pageable解析更改（spring data）
		 onSelectRow:function(ids){
			 if(ids){
				 //goto_roleryxxid=ids; 
			 }
		 },
		 gridComplete:function(){
			 //this.id==$.jgrid.jqID(this.id);虽然二者相等，但当有特殊字符时，jqID会作处理
			 //角色成员list载入后定位到第一行，或者定位到新增修改的那一行
		     if($(this).getDataIDs().length>0){
		    	 $(this).jqGrid('setSelection',$(this).getDataIDs()[0]);
		     }
		 } 
	 }).navGrid('#ryxxpager',{	
		 edit:Boolean(false),
		 add:Boolean("${editFlag}"),
		 del:Boolean("${editFlag}"),	
		 search:false 	 //隐藏查询功能，默认总是显示	    
	 },
	 {
	 }, 
	 {	 //新增
		 beforeInitData:function(){
			 var condition = " d not in (select rr.ryxx from RoleRyxx rr where rr.role.id = " + cur_roleid + ") and d.employed=true ";
			 $('#tabs-2')._selCommon('SE', '1', true, 'id,rybh', condition); 	
			 return false;
		 }  
	 }, 
	 {
		 onclickSubmit:function(params,postdata){	
		 params.url="security/roleright/roleryxx/"+$(this).jqGrid('getGridParam','selarrrow');		            
	 }  
 	});  
	     
 	jqGridButton("ryxxlist","ryxxpager",1)

	 //角色grid定义			    		 
	 $("#toplist").jqGrid({ 
		 url: '<c:url value="/security/roleright/roles"/>', 
		 datatype:"json",
		 colNames:['','角色编号','角色名称','创建时间'], //表头
		 colModel:[ //这里会根据index去解析jsonReader中root对象的属性，填充cell
		   		 {name:'id', index:'id', key:true, hidden:true, editable:true},		   		 
		   		 {name:'code', index:'code', width:55, align:"center", sortable:true, editable:true, editoptions:{size:10}}, 
		       	 {name:'name', index:'name', width:100, sortable:true, editable:true, editoptions:{size:24}, editrules:{required:true}},
		       	 {name:'createTime', index:'createTime', width:100, sortable:true, editable:true, editrules:{edithidden: true}}			     
			     ], 
	     height: topGridHeight,   
		 rowNum: numOfTopRow, //每页记录数  
		 pager: '#toppager',  //分页标签divID  
		 sortname: "code",
		 sortorder: "asc", 
		 caption:'角色信息',
		 prmNames: {rows:"size", sort:"sidx", order:"sord"},  //适应controller中Pageable解析更改（spring data）		 
		 onSelectRow:function(ids){
			 if(ids){
				 cur_roleid=ids;
				 	
				 //显示用户权限
				 showJsqx();	

				 //载入角色人员list
				 var v_url='<c:url value="/security/roleright/ryxxs?roleid="/>'+ids;
	             $("#ryxxlist").jqGrid('setGridParam',{url:v_url,datatype:'json'}).trigger('reloadGrid');  	 				 					  
			 }
		 },			
		 gridComplete:function(){ 						
		    //明细list载入后定位到第一行
		    if($(this).getDataIDs().length>0){  			    
			    $(this).jqGrid('setSelection', $(this).getDataIDs()[0]);				
		    }
		} 
	 }).navGrid('#toppager',{	
		edit: '${editFlag}', 
		add:  '${editFlag}',
		del:  '${editFlag}',
		search:false 	 //隐藏查询功能，默认总是显示	    
	 },
	 {//修改窗口相关属性
		 width:600,
		 onclickSubmit:function(params,postdata){
	     postdata._method='PUT'; 
	     params.url="security/roleright/role/"+$(this).jqGrid('getGridParam','selrow');
	     },
	     //beforeInitData: topedit,
		 onInitializeForm: onInitializeFormfunc
	 },
	 {//新增窗口相关属性 
		 width:600,
		 url:"security/roleright/role",
		 //beforeInitData:topedit, 
		 onInitializeForm:onInitializeFormfunc
	 },
	 { //删除窗口相关属性
		 msg:"删除角色会同时删除角色功能和角色成员，确定删除？",   
		 width:520,
		 onclickSubmit:function(params,postdata){
			 params.url="security/roleright/role/"+$(this).jqGrid('getGridParam','selrow');
		 },
		 onClose:function(){
			 //关闭时将窗口清除
			 $("#delmodtoplist").remove(); 
			 $('.ui-widget-overlay').remove(); 
		 }  
	 }); 

	 //第一个参数为jqGrid的ID,
	 //第二个参数为翻页功能条的ID
	 //第三个参数为1表示此列表不需要模糊查询，不带此参数，表示默认需要模糊查询 
	 jqGridButton("toplist", "toppager", 1);	

	 if('${editFlag}'=='true'){		 
	     $("#toplist").jqGrid('navButtonAdd','#toplist_toppager_left',{caption:'授权', title:'授权',
		     id:"auth_toplist_top",buttonicon:'ui-icon-document',
			 onClickButton:function(){
				 var opt={title:'角色授权',
						url:'<c:url value="/security/roleright/getrolefunction/'+cur_roleid+'"/>',
						submiturl:'<c:url value="/security/roleright/saverolefunction/'+cur_roleid+'" />',
						colNames:['功能名称','','',''], //表头
						colModel:[ //这里会根据index去解析jsonReader中root对象的属性，填充cell
						{name:'functionname', index:'functionname',width:300, sortable:false},
						{name:'enbl',index:'enbl',width:60,align:'center',editable:true,edittype:'checkbox',editoptions:{value:'1:0'},formatoptions:{disabled:false}},
						{name:'id', index:'id',key:true,hidden:true},
						{name:'idx', index:'idx',editable:true,hidden:true}						
						], 
						ExpandColumn:"functionname",
						submitparam:"id,idx",						
						oneditfunc:oneditfunc,
						afterSubmit:function(){
							//刷新用户权限
							showJsqx();
						}
					};
				dialog_treegrid(opt);
			 }});  
     }	 

	 function oneditfunc(rowid){   
		
	 }	
	 
	 $("#tabs").tabs( //默认jquery处理显示tab对应的div层，各个div层的内容在之前已经处理好
		{collapsible:false},  
		{
	   		beforeLoad: tabBeforeLoad,   //tab载入异常处理，在jquery.jqGrid.custom.js中定义
	       	activate:function(event,ui){
           		if(ui.newTab.index()==1){
         	   		//选择某个TAB后执行动作，例如载入要显示的内容。如果选中主表时已经更新所有明细TAB页，这里就不用再更新。
                }
            }
		}
	  );	 

	 $("#tabs-1").height($("#tabs").height()-40);
		 
 });	 	 
</script> 

<div id="topdiv" class="chc_top_jqgrid">
	<table id="toplist" style="width:100%"><tr><td/></tr></table>
    <div id="toppager"></div>     
</div>
<div id="tabs" class="chc_tabs">
	<ul>
		<li><a href="#tabs-1">角色权限</a></li>	
		<li><a href="#tabs-2">角色成员</a></li>				
	</ul>
    <div id="tabs-1" style="overflow-y:scroll;height:100%;"> 
   		<ul id="tree" class="ztree"></ul>		
	</div>    
	<div id="tabs-2" > 
    	<table id="ryxxlist" style="width:100%"><tr><td/></tr></table>  
   		<div id="ryxxpager"></div>
	</div>	    	    
</div>  	