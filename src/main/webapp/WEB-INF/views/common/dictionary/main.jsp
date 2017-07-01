<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%> 
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags"%>  

<!-- 设置编辑权限变量值 -->
<c:set value="" var="editFlag" ></c:set>
<sec:authorize access="hasRole('ROLE_ADMIN')">
	<c:set value="true" var="editFlag" ></c:set>    
</sec:authorize>

<script type="text/javascript"> 
var cur_itemid="";//主档当前ID
var goto_itemid;//修改记录后定位主档ID
var goto_valueid;//修改记录后定位明细ID 

//在jquery.jgGrid.custom.js中调用
function getRecordIdAfterEdit(objid, res){ 
	//objid为jqGrid列表的id，res为后台返回的JSON数据	
	if(objid=="toplist") 
		goto_itemid=res.key_id;
    else 
        goto_valueid=res.key_id;
}

//明细新增提交前赋值
function mxaddBeforeSubmit(postdata, formid){
	 postdata['dictionaryItem.id']= cur_itemid;	 
 	 return [true,'']; 
}

//主表编辑前
function topedit(tableid){	
	//变换表单布局，默认为一列多行，当字段较多时，在此处可以作一些变换，变成多列多行。
	//一般将此函数(函数名称可变)对应至jqGrid的beforeInitData接口函数
	$(this).setColProp('code',{formoptions:{rowpos:1,colpos:1}});
	$(this).setColProp('name',{formoptions:{rowpos:2,colpos:1}});
	$(this).setColProp('memo',{formoptions:{rowpos:3,colpos:1}});	   
}

//编辑Form产生前初始函数
 function onInitializeFormfunc(formobj,frmoper){  
	 if(frmoper=='add'){
		 $("#type",formobj).val("U"); //类型总是【用户定义】，【系统定义】在系统上线时初始化且不可删除和修改
	 }	 
 }
 
 //编辑Form产生后函数
 function editAfterShowFormFunc(formobj,frmoper){

 }
 
 //需要在通用选取后做一些事，执行nextdo()
 function nextdo(fieldid,formobj){ 
	
 }
 
 $(function(){ 
	 //调整上下帧高度及GRID的行数，在jquery.jgGrid.custom.js中实现
	 t_b_height_rownum(); 

	 //明细grid定义			    		 
	 $("#mxlist").jqGrid({  
		 colNames:['','代码', '值', '类型','备注',''], //表头
		 colModel:[ //这里会根据index去解析jsonReader中root对象的属性，填充cell
		   	{name:'id', index:'id', key:true, hidden:true, editable:true},           
			{name:'code', index:'code', width:60, align:"center", sortable:true, editable:true, editoptions:{size:24}, editrules:{required:true}}, 
			{name:'value', index:'value', width:120, sortable:true, editable:true, editoptions:{size:24}, editrules:{required:true}},			       	 
			{name:'type', index:'type', width:60, editable:true, edittype:'select', editoptions:{value:'S:系统定义;U:用户定义',disabled:true}, formatter:'select'}, 			       	
			{name:'memo', index:'memo', width:120, align:"center", sortable:false, editable:true, edittype:'textarea',editoptions:{rows:"3",cols:"50"}} ,
			{name:'dictionaryItem.id', index:'dictionaryItem.id', hidden:true, editable:true}], 
		 height: bottomGridHeight, //下帧高度    
		 rowNum: numOfBottomRow, //每页记录数
		 pager: '#mxpager', //分页标签divID  
		 sortname: "code",
		 sortorder: "asc", 
		 multiselect: true, //多选框        
		 multiboxonly: true, //在点击表格row时只支持单选，只有当点击checkbox时才多选，需要multiselect=true是有效
		 prmNames: {rows:"size", sort:"sidx", order:"sord"},  //适应controller中Pageable解析更改（spring data）
		 onSelectRow:function(ids){
			 if(ids){
				 //当前数据字典值的类型为【用户定义】时，修改和删除按钮才显示，否则隐藏		
			     if($("#mxlist").jqGrid('getRowData',ids)['type'] == "U"){							
					$("#edit_mxlist_top").show();
					$("#del_mxlist_top").show();							
				}else{							
					$("#edit_mxlist_top").hide();
					$("#del_mxlist_top").hide();							
				}	                      
			}
		 },			
		 gridComplete:function(){ 				
		    if($(this).getDataIDs().length>0){  //明细list载入后定位到第一行或者新增修改的那一行			    
			    if(goto_valueid){				    		    
			  		$(this).jqGrid('setSelection', goto_valueid);
			    	goto_valueid=null;
				}else{
		    		$(this).jqGrid('setSelection', $(this).getDataIDs()[0]);
				}

			    //有记录时显示修改和删除按钮					
				$("#edit_mxlist_top").show();
				$("#del_mxlist_top").show();
		    }else{			    
		    	//明细表没有数据时，隐藏删改按钮		    	
		    	$("#edit_mxlist_top").hide();
				$("#del_mxlist_top").hide();
			}
		 } 
	 }).navGrid('#mxpager',{	
			edit: Boolean("${editFlag}"), 
			add: Boolean("${editFlag}"),
			del: Boolean("${editFlag}"),		    
			search:false 	 //隐藏查询功能，默认总是显示	    
		 },
		 {//修改
			 width:400,
             onclickSubmit:function(params,postdata){
                 postdata._method='PUT';  
                 params.url="common/dictionary/value/"+postdata.id;
             },  
			 onInitializeForm:onInitializeFormfunc 
		 },
		 {//新增
			 width:400,
			 url:"common/dictionary/value", 
			 beforeSubmit:mxaddBeforeSubmit
			 ,onInitializeForm:onInitializeFormfunc 
		 }, 
		 {//删除
			onclickSubmit:function(params,postdata){ 					
		    params.url="common/dictionary/value/"+$(this).jqGrid('getRowData',postdata).id; 
		 }
	});  

	//第一个参数为jqGrid的ID,
	//第二个参数为翻页功能条的ID
	//第三个参数为1表示此列表不需要模糊查询，不带此参数，表示默认需要模糊查询 	
	jqGridButton("mxlist","mxpager",1);	 
	 
	//主档grid定义	
	$("#toplist").jqGrid({
		url: '<c:url value="/common/dictionary/item"/>', 
		datatype:"json",
		colNames:['','代码','名称','备注'], 
		colModel:[ //这里会根据index去解析jsonReader中root对象的属性，填充cell 		   		     
		    {name:'id', index:'id', hidden:true, key:true, viewable:false},  
			//不用KEY:TRUE，下面prmNames中不要定义ID,用, editable:true,edittype:'custom',editoptions:{custom_element:myelem,custom_value:myval}也可以			{name:'code', index:'code', width:55, align:"center",sortable:true,editable:true,editoptions:{size:24, disabled:'disabled'}}, 
			{name:'name', index:'name', width:100, sortable:true,editable:true,editoptions:{size:24},editrules:{required:true}},
			{name:'memo', index:'memo', width:80,align:"center", sortable:false, search:false, editable:true, edittype:'textarea',editoptions:{rows:"3",cols:"50"}}], 
			height: topGridHeight,   
			rowNum: numOfTopRow, //每页记录数  
			pager: '#toppager', //分页标签divID    
			sortname: "code",
			sortorder: "asc",            
			caption:'数据字典项', //显示查询结果表格标题     
			hidegrid:false,  		    
		    prmNames: {rows:"size", sort:"sidx", order:"sord"},  //适应controller中Pageable解析更改（spring data）
			onSelectRow:function(ids){ 
		      if(ids){ 			      
		    	  //因为id设有KEY,所以 $("#toplist").jqGrid('getGridParam','selrow')就是ID,但是如果没有勾选时，selrow为null;
			      cur_itemid=ids;
		    
		          //载入明细list   
		          var mx_url = '<c:url value="/common/dictionary/value?id="/>' + ids;
                  $("#mxlist").jqGrid('setGridParam',{url:mx_url, datatype:'json'}).trigger('reloadGrid');                   
			  }
			},
			gridComplete:function(){   //主表list载入后定位到第一行或者新增修改的那一行 				
		       if($(this).getDataIDs().length>0){     
		    	   if(goto_itemid==null) 
			    	   $(this).jqGrid('setSelection',$(this).getDataIDs()[0]);
		    	   else{
		    		   $(this).jqGrid('setSelection',goto_itemid);
		    		   goto_itemid=null;
		    	   }		

		    	   //主表有数据时，显示主表修改/明细新增按钮
		    	   $("#edit_toplist_top").show();
		    	   $("#add_mxlist_top").show();	           	   
		       }else{
			       //主表没有数据时，隐藏主表修改/明细增删改按钮
		    	   $("#edit_toplist_top").hide();
		    	   $("#add_mxlist_top").hide();
		    	   $("#edit_mxlist_top").hide();
				   $("#del_mxlist_top").hide();
				   //清除明细grid
				   $("#mxlist").clearGridData();   
			   }
			}			
		}).navGrid('#toppager',{ //根据权限显示对应的功能按钮，后面还有查询和刷新两个按钮，没有设置默认总是显示
			    edit:Boolean("${editFlag}"),
			    add:Boolean(false),  //不可新增
			    del:Boolean(false)   //不可删除
		    },
		    {//修改窗口相关属性  
			  width:400,
			  onclickSubmit:function(params,postdata){
            	  postdata._method='PUT'; 
                  params.url="common/dictionary/item/"+$(this).jqGrid('getGridParam','selrow');
               },
              beforeInitData: topedit
			  ,onInitializeForm: onInitializeFormfunc
			  //,afterShowForm:editAfterShowFormFunc
			},
		    {//新增窗口相关属性 
			    			   
			 },
		    {//删除窗口相关属性 	
				    			 
			} 
		 ); 
	     jqGridButton("toplist","toppager",1); 
	 
		$("#tabs").tabs( //默认jquery处理显示tab对应的div层，各个div层的内容在之前已经处理好
		{collapsible:false},  
		{
       		beforeLoad: tabBeforeLoad,   //tab载入异常处理，在jquery.jqGrid.custom.js中定义

         	activate:function(event,ui){
           		if(ui.newTab.index()==1){
        	   		//选择某个TAB后执行动作，例如载入要显示的内容
                }
            }
		}	
	);		 
});	 	 
</script> 

<div id="topdiv" class="chc_top_jqgrid">
	<table id="toplist" style="width:100%"><tr><td/></tr></table>
    <div id="toppager"></div>     
</div>
<div id="tabs" class="chc_tabs">
	<ul>
		<li><a href="#tabs-1" >数据字典值</a></li>					
	</ul>
    <div id="tabs-1" > 
   		<table id="mxlist" style="width:100%"><tr><td/></tr></table>  
	 	<div id="mxpager"></div>
	</div>    
	<div id="tabs-2" style="vertical-align:middle;"> 	
	</div> 	    	    
</div>  
	