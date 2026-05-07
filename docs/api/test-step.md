[Test Steps](#_test_steps)
--------------------------

This chapter focuses on services for the test steps.

###  [![get](images/get.png) Get test step](#_get_test_step)

A `GET` to `/test-steps/{id}` returns the test step with the given id. This step can be either an action step, a call step, or a keyword step.

#### [Path parameters](#_get_test_step_path_parameters)

Table 6. /api/rest/latest/test-steps/{id}  

Parameter

Description

`id`

the id of the step (optional)

#### [HTTP request](#_get_test_step_http_request)

    GET /api/rest/latest/test-steps/235 HTTP/1.1
    Accept: application/json
    Host: localhost:8080

#### [Query parameters](#_get_test_step_query_parameters)

 

Parameter

Description

`fields`

which fields of the elements should be returned (optional)

#### [In case of an action step](#_in_case_of_an_action_step)

##### [Example response](#_in_case_of_an_action_step_http_response)

    HTTP/1.1 200 OK
    Content-Type: application/json
    Content-Length: 798
    
    {
      "_type" : "action-step",
      "id" : 235,
      "test_case" : {
        "_type" : "test-case",
        "id" : 120,
        "name" : "Door opening system",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/test-cases/120"
          }
        }
      },
      "action" : "<p>Wave your hand</p>",
      "expected_result" : "<p>The door opens</p>",
      "index" : 0,
      "custom_fields" : [ {
        "code" : "cuf_txt_note",
        "label" : "note",
        "value" : "Star Trek style welcomed but not mandatory"
      }, {
        "code" : "cuf_tags_see_also",
        "label" : "see also",
        "value" : [ "smart home", "sensors", "hand gesture" ]
      } ],
      "verified_requirements" : [ ],
      "attachments" : [ ],
      "_links" : {
        "self" : {
          "href" : "http://localhost:8080/api/rest/latest/test-steps/235"
        }
      }
    }

##### [Response fields](#_in_case_of_an_action_step_response_fields)

  

Path

Type

Description

`id`

`Number`

the id of the step

`_type`

`String`

the type of step

`action`

`String`

the action to be accomplished, format is html

`expected_result`

`String`

the state or behavior that should be observable when the action has been performed, format is html)

`test_case`

`Object`

the test case this step is part of

`index`

`Number`

the index of current step in the test case

`custom_fields`

`Array`

the custom fields of that test step

`custom_fields[].label`

`String`

the label of the custom field

`custom_fields[].code`

`String`

the code of the custom field

`custom_fields[].value`

`Varies`

the value of the custom field. The value is either a string (for most custom fields), or an array of strings (for multivalued custom fields eg a tag list)

`attachments`

`Array`

the attachments of that test step

`verified_requirements`

`Array`

the list of verified requirements. Please refer to the requirements documentation.

`_links`

`Object`

related links

##### [Links](#_in_case_of_an_action_step_links)

 

Relation

Description

`self`

link to this step

#### [In case of a call step](#_in_case_of_a_call_step)

##### [Example response](#_in_case_of_a_call_step_http_response)

    HTTP/1.1 200 OK
    Content-Type: application/json
    Content-Length: 854
    
    {
      "_type" : "call-step",
      "id" : 441,
      "test_case" : {
        "_type" : "test-case",
        "id" : 297,
        "name" : "Order a meal",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/test-cases/297"
          }
        }
      },
      "delegate_parameter_values" : false,
      "called_test_case" : {
        "_type" : "test-case",
        "id" : 276,
        "name" : "Order a coffee",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/test-cases/276"
          }
        }
      },
      "called_dataset" : {
        "_type" : "dataset",
        "id" : 33,
        "name" : "topping",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/datasets/33"
          }
        }
      },
      "index" : 0,
      "_links" : {
        "self" : {
          "href" : "http://localhost:8080/api/rest/latest/test-steps/441"
        }
      }
    }

##### [Response fields](#_in_case_of_a_call_step_response_fields)

  

Path

Type

Description

`id`

`Number`

the id of the step

`_type`

`String`

the type of step

`test_case`

`Object`

the test case this step belongs to

`index`

`Number`

the index of the step in the test case

`called_test_case`

`Object`

the test case called by this step

`called_dataset`

`Object`

the dataset to use for the called test case, if any (may be null if not)

`delegate_parameter_values`

`Boolean`

whether the parameters of the called test case should be set by the caller rather than by a dataset of the called. A value of 'true' usually mean that the 'called\_dataset' is null.

`_links`

`Object`

related links

##### [Links](#_in_case_of_a_call_step_links)

 

Relation

Description

`self`

link to this step

#### [In case of a keyword step](#_in_case_of_a_keyword_step)

##### [Example response](#_in_case_of_a_keyword_step_http_response)

    HTTP/1.1 200 OK
    Content-Type: application/json
    Content-Length: 610
    
    {
      "_type" : "keyword-step",
      "id" : 442,
      "test_case" : {
        "_type" : "keyword-test-case",
        "id" : 298,
        "name" : "Order a meal",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/test-cases/298"
          }
        }
      },
      "keyword" : "GIVEN",
      "action" : "a customer named \"Gustave\"",
      "datatable" : "| product | price |\n| Expresso | 0.40 |",
      "docstring" : "",
      "comment" : "Products are from France.\nPrices are all with tax.",
      "index" : 0,
      "_links" : {
        "self" : {
          "href" : "http://localhost:8080/api/rest/latest/test-steps/442"
        }
      }
    }

##### [Response fields](#_in_case_of_a_keyword_step_response_fields)

  

Path

Type

Description

`id`

`Number`

the id of the step

`_type`

`String`

the type of step

`test_case`

`Object`

the test case this step belongs to

`keyword`

`String`

the part which gives structure and meaning to an action word. Possible values are : GIVEN, WHEN, THEN, BUT, AND

`action`

`String`

the action of the step

`datatable`

`String`

the datatable of the step

`docstring`

`String`

the docstring of the step

`comment`

`String`

the comment of the step

`index`

`Number`

the index of the step in the test case

`_links`

`Object`

related links

##### [Links](#_in_case_of_a_keyword_step_links)

 

Relation

Description

`self`

link to this step

###  [![patch](images/patch.png) Modify test step](#_modify_test_step)

A `PATCH` to `/test-steps/{id}` modifies the test step with the given id.

#### [Path parameters](#_modify_test_step_path_parameters)

Table 6. /api/rest/latest/test-steps/{id}  

Parameter

Description

`id`

the id of the step

#### [Query parameters](#_modify_test_step_query_parameters)

 

Parameter

Description

`fields`

which fields of the elements should be returned (optional)

#### [In case of an action step](#_in_case_of_an_action_step_2)

##### [HTTP request](#_in_case_of_an_action_step_2_http_request)

    PATCH /api/rest/latest/test-steps/210 HTTP/1.1
    Content-Type: application/json
    Accept: application/json
    Content-Length: 314
    Host: localhost:8080
    
    {
      "_type" : "action-step",
      "action" : "<p>hadouken</p>",
      "expected_result" : "<p>ko</p>",
      "custom_fields" : [ {
        "code" : "cuf_txt_note",
        "value" : "Star Trek style welcomed but not mandatory"
      }, {
        "code" : "cuf_tags_see_also",
        "value" : [ "smart home", "sensors", "hand gesture" ]
      } ]
    }

##### [Request fields](#_in_case_of_an_action_step_2_request_fields)

  

Path

Type

Description

`_type`

`String`

the type of step

`action`

`String`

the action to be accomplished, format is html

`expected_result`

`String`

the state or behavior that should be observable when the action has been performed, format is html)

`custom_fields`

`Array`

the custom fields of that test step

`custom_fields[].code`

`String`

the code of the custom field

`custom_fields[].value`

`Varies`

the value of the custom field. The value is either a string (for most custom fields), or an array of strings (for multivalued custom fields eg a tag list)

##### [Example response](#_in_case_of_an_action_step_2_http_response)

    HTTP/1.1 200 OK
    Content-Type: application/json
    Content-Length: 874
    
    {
      "_type" : "action-step",
      "id" : 210,
      "test_case" : {
        "_type" : "test-case",
        "id" : 240,
        "name" : "target test case",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/test-cases/240"
          }
        }
      },
      "action" : "<p>hadouken</p>",
      "expected_result" : "<p>ko</p>",
      "index" : 0,
      "custom_fields" : [ {
        "code" : "cuf_txt_note",
        "label" : "note",
        "value" : "Star Trek style welcomed but not mandatory"
      }, {
        "code" : "cuf_tags_see_also",
        "label" : "see also",
        "value" : [ "smart home", "sensors", "hand gesture" ]
      } ],
      "verified_requirements" : [ ],
      "attachments" : [ ],
      "_links" : {
        "self" : {
          "href" : "http://localhost:8080/api/rest/latest/test-steps/210"
        },
        "test-case" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240"
        }
      }
    }

##### [Response fields](#_in_case_of_an_action_step_2_response_fields)

  

Path

Type

Description

`id`

`Number`

the id of the step

`test_case`

`Object`

the test case this step is part of

`index`

`Number`

the index of current step in the test case

`custom_fields[].label`

`String`

the label of the custom field

`_links`

`Object`

related links

##### [Links](#_in_case_of_an_action_step_2_links)

 

Relation

Description

`self`

link to this step

`test-case`

link to the test case where this step belongs

#### [In case of a call step](#_in_case_of_a_call_step_2)

##### [HTTP request](#_in_case_of_a_call_step_2_http_request)

    PATCH /api/rest/latest/test-steps/441 HTTP/1.1
    Content-Type: application/json
    Accept: application/json
    Content-Length: 150
    Host: localhost:8080
    
    {
      "_type" : "call-step",
      "delegate_parameter_values" : "false",
      "index" : 0,
      "called_dataset" : {
        "_type" : "dataset",
        "id" : 33
      }
    }

##### [Request fields](#_in_case_of_a_call_step_2_request_fields)

  

Path

Type

Description

`_type`

`String`

the type of step

`delegate_parameter_values`

`String`

whether the parameters of the called test case should be set by the caller rather than by a dataset of the called. A value of 'true' usually mean that the 'called\_dataset' is null.

`index`

`Number`

the index of the step in the test case

`called_dataset`

`Object`

the dataset to use for the called test case, if any (may be null if not)

##### [Example response](#_in_case_of_a_call_step_2_http_response)

    HTTP/1.1 200 OK
    Content-Type: application/json
    Content-Length: 954
    
    {
      "_type" : "call-step",
      "id" : 441,
      "test_case" : {
        "_type" : "test-case",
        "id" : 297,
        "name" : "target test case",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/test-cases/297"
          }
        }
      },
      "delegate_parameter_values" : false,
      "called_test_case" : {
        "_type" : "test-case",
        "id" : 365,
        "name" : "call me later",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/test-cases/365"
          }
        }
      },
      "called_dataset" : {
        "_type" : "dataset",
        "id" : 33,
        "name" : "topping",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/datasets/33"
          }
        }
      },
      "index" : 0,
      "_links" : {
        "self" : {
          "href" : "http://localhost:8080/api/rest/latest/test-steps/441"
        },
        "test-case" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/297"
        }
      }
    }

##### [Response fields](#_in_case_of_a_call_step_2_response_fields)

  

Path

Type

Description

`id`

`Number`

the id of the step

`_links`

`Object`

related links

##### [Links](#_in_case_of_a_call_step_2_links)

 

Relation

Description

`self`

link to this step

`test-case`

link to the test case where this step belongs

#### [In case of a keyword step](#_in_case_of_a_keyword_step_2)

##### [HTTP request](#_in_case_of_a_keyword_step_2_http_request)

    PATCH /api/rest/latest/test-steps/441 HTTP/1.1
    Content-Type: application/json
    Accept: application/json
    Content-Length: 293
    Host: localhost:8080
    
    {
      "_type" : "keyword-step",
      "index" : 0,
      "keyword" : "GIVEN",
      "action" : "I am \"happy\"",
      "datatable" : "| Product | Price |\n| Espresso | 0.30 |\n| Cappuccino | 0.30 |\n| Macchiato | 0.30 |",
      "docstring" : "",
      "comment" : "Products are from France.\nPrices are all with tax."
    }

##### [Request fields](#_in_case_of_a_keyword_step_2_request_fields)

  

Path

Type

Description

`_type`

`String`

the type of step

`index`

`Number`

the index of the step in the test case

`keyword`

`String`

the part which gives structure and meaning to an action word. Possible values are : GIVEN, WHEN, THEN, BUT, AND

`action`

`String`

the action of the step

`datatable`

`String`

the datatable of the step

`docstring`

`String`

the docstring of the step

`comment`

`String`

the comment of the step

##### [Example response](#_in_case_of_a_keyword_step_2_http_response)

    HTTP/1.1 200 OK
    Content-Type: application/json
    Content-Length: 748
    
    {
      "_type" : "keyword-step",
      "id" : 441,
      "test_case" : {
        "_type" : "keyword-test-case",
        "id" : 297,
        "name" : "target test case",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/test-cases/297"
          }
        }
      },
      "keyword" : "AND",
      "action" : "I am \"happy\"",
      "datatable" : "| Product | Price |\n| Espresso | 0.30 |\n| Cappuccino | 0.30 |\n| Macchiato | 0.30 |",
      "docstring" : "",
      "comment" : "Products are from France.\nPrices are all with tax.",
      "index" : 0,
      "_links" : {
        "self" : {
          "href" : "http://localhost:8080/api/rest/latest/test-steps/441"
        },
        "keyword-test-case" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/297"
        }
      }
    }

##### [Response fields](#_in_case_of_a_keyword_step_2_response_fields)

  

Path

Type

Description

`id`

`Number`

the id of the step

`test_case`

`Object`

the test case this step is part of

`_links`

`Object`

related links

##### [Links](#_in_case_of_a_keyword_step_2_links)

 

Relation

Description

`self`

link to this step

`keyword-test-case`

link to the test case where this step belongs

###  [![delete](images/delete.png) Delete test step](#_delete_test_step)

A `DELETE` to `/test-steps/{ids}` deletes the test steps with the given ids.

#### [Path parameters](#_delete_test_step_path_parameters)

Table 6. /api/rest/latest/test-steps/{ids}  

Parameter

Description

`ids`

the list of ids of the steps

#### [HTTP request](#_delete_test_step_http_request)

    DELETE /api/rest/latest/test-steps/169,180 HTTP/1.1
    Content-Type: application/json
    Accept: application/json
    Host: localhost:8080

###  [![post](images/post.png) Create test step](#_create_test_step)

A `POST` to `/test-cases/{testCaseId}/steps` creates a new test step (action step or call step).

#### [Path parameters](#_create_test_step_path_parameters)

Table 6. /api/rest/latest/test-cases/{testCaseId}/steps  

Parameter

Description

`testCaseId`

the id of the test case of which to add new test step

#### [Query parameters](#_create_test_step_query_parameters)

 

Parameter

Description

`fields`

which fields of the elements should be returned (optional)

#### [In case of an action step](#_in_case_of_an_action_step_3)

##### [HTTP request](#_in_case_of_an_action_step_3_http_request)

    POST /api/rest/latest/test-cases/240/steps HTTP/1.1
    Content-Type: application/json
    Accept: application/json
    Content-Length: 331
    Host: localhost:8080
    
    {
      "_type" : "action-step",
      "action" : "<p>simple test step</p>",
      "expected_result" : "<p>action step</p>",
      "custom_fields" : [ {
        "code" : "cuf_txt_note",
        "value" : "Star Trek style welcomed but not mandatory"
      }, {
        "code" : "cuf_tags_see_also",
        "value" : [ "smart home", "sensors", "hand gesture" ]
      } ]
    }

##### [Request fields](#_in_case_of_an_action_step_3_request_fields)

  

Path

Type

Description

`_type`

`String`

the type of step

`action`

`String`

the action to be accomplished, format is html

`expected_result`

`String`

the state or behavior that should be observable when the action has been performed, format is html)

`custom_fields`

`Array`

the custom fields of that test step

`custom_fields[].code`

`String`

the code of the custom field

`custom_fields[].value`

`Varies`

the value of the custom field. The value is either a string (for most custom fields), or an array of strings (for multivalued custom fields eg a tag list)

##### [Example response](#_in_case_of_an_action_step_3_http_response)

    HTTP/1.1 201 Created
    Content-Type: application/json
    Content-Length: 891
    
    {
      "_type" : "action-step",
      "id" : 210,
      "test_case" : {
        "_type" : "test-case",
        "id" : 240,
        "name" : "target test case",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/test-cases/240"
          }
        }
      },
      "action" : "<p>simple test step</p>",
      "expected_result" : "<p>action step</p>",
      "index" : 0,
      "custom_fields" : [ {
        "code" : "cuf_txt_note",
        "label" : "note",
        "value" : "Star Trek style welcomed but not mandatory"
      }, {
        "code" : "cuf_tags_see_also",
        "label" : "see also",
        "value" : [ "smart home", "sensors", "hand gesture" ]
      } ],
      "verified_requirements" : [ ],
      "attachments" : [ ],
      "_links" : {
        "self" : {
          "href" : "http://localhost:8080/api/rest/latest/test-steps/210"
        },
        "test-case" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240"
        }
      }
    }

##### [Response fields](#_in_case_of_an_action_step_3_response_fields)

  

Path

Type

Description

`id`

`Number`

the id of the step

`test_case`

`Object`

the test case this step is part of

`index`

`Number`

the index of current step in the test case

`custom_fields[].label`

`String`

the label of the custom field

`_links`

`Object`

related links

##### [Links](#_in_case_of_an_action_step_3_links)

 

Relation

Description

`self`

link to this step

`test-case`

link to the test case where this step belongs

#### [In case of a call step](#_in_case_of_a_call_step_3)

##### [HTTP request](#_in_case_of_a_call_step_3_http_request)

    POST /api/rest/latest/test-cases/297/steps HTTP/1.1
    Content-Type: application/json
    Accept: application/json
    Content-Length: 267
    Host: localhost:8080
    
    {
      "_type" : "call-step",
      "delegate_parameter_values" : false,
      "called_test_case" : {
        "_type" : "test-case",
        "id" : 276,
        "name" : "test case been called"
      },
      "called_dataset" : {
        "_type" : "dataset",
        "id" : 33,
        "name" : "topping"
      }
    }

##### [Request fields](#_in_case_of_a_call_step_3_request_fields)

  

Path

Type

Description

`_type`

`String`

the type of step

`delegate_parameter_values`

`Boolean`

whether the parameters of the called test case should be set by the caller rather than by a dataset of the called. A value of 'true' usually mean that the 'called\_dataset' is null.

`called_test_case`

`Object`

the test case called by this step

`called_dataset`

`Object`

the dataset to use for the called test case, if any (may be null if not)

##### [Example response](#_in_case_of_a_call_step_3_http_response)

    HTTP/1.1 201 Created
    Content-Type: application/json
    Content-Length: 962
    
    {
      "_type" : "call-step",
      "id" : 441,
      "test_case" : {
        "_type" : "test-case",
        "id" : 297,
        "name" : "target test case",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/test-cases/297"
          }
        }
      },
      "delegate_parameter_values" : false,
      "called_test_case" : {
        "_type" : "test-case",
        "id" : 276,
        "name" : "test case been called",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/test-cases/276"
          }
        }
      },
      "called_dataset" : {
        "_type" : "dataset",
        "id" : 33,
        "name" : "topping",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/datasets/33"
          }
        }
      },
      "index" : 0,
      "_links" : {
        "self" : {
          "href" : "http://localhost:8080/api/rest/latest/test-steps/441"
        },
        "test-case" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/297"
        }
      }
    }

##### [Response fields](#_in_case_of_a_call_step_3_response_fields)

  

Path

Type

Description

`id`

`Number`

the id of the step

`test_case`

`Object`

the test case this step belongs to

`index`

`Number`

the index of the step in the test case

`_links`

`Object`

related links

##### [Links](#_in_case_of_a_call_step_3_links)

 

Relation

Description

`self`

link to this step

`test-case`

link to the test case where this step belongs

#### [In case of a keyword step](#_in_case_of_a_keyword_step_3)

##### [HTTP request](#_in_case_of_a_keyword_step_3_http_request)

    POST /api/rest/latest/test-cases/241/steps HTTP/1.1
    Content-Type: application/json
    Accept: application/json
    Content-Length: 277
    Host: localhost:8080
    
    {
      "_type" : "keyword-step",
      "keyword" : "AND",
      "action" : "I have 5 apples",
      "datatable" : "| Product | Price |\n| Espresso | 0.30 |\n| Cappuccino | 0.40 |\n| Macchiato | 0.40 |",
      "docstring" : "",
      "comment" : "Products are from France.\nPrices are all with tax."
    }

##### [Request fields](#_in_case_of_a_keyword_step_3_request_fields)

  

Path

Type

Description

`_type`

`String`

the type of step

`keyword`

`String`

the part which gives structure and meaning to an action word. Possible values are : GIVEN, WHEN, THEN, BUT, AND

`action`

`String`

the action of the step

`datatable`

`String`

the datatable of the step

`docstring`

`String`

the docstring of the step

`comment`

`String`

the comment of the step

##### [Example response](#_in_case_of_a_keyword_step_3_http_response)

    HTTP/1.1 201 Created
    Content-Type: application/json
    Content-Length: 761
    
    {
      "_type" : "keyword-step",
      "id" : 210,
      "test_case" : {
        "_type" : "keyword-test-case",
        "id" : 241,
        "name" : "target keyword test case",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/test-cases/241"
          }
        }
      },
      "keyword" : "AND",
      "action" : "I have \"5\" apples",
      "datatable" : "| Product | Price |\n| Espresso | 0.30 |\n| Cappuccino | 0.40 |\n| Macchiato | 0.40 |",
      "docstring" : "",
      "comment" : "Products are from France.\nPrices are all with tax.",
      "index" : 0,
      "_links" : {
        "self" : {
          "href" : "http://localhost:8080/api/rest/latest/test-steps/210"
        },
        "keyword-test-case" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/241"
        }
      }
    }

##### [Response fields](#_in_case_of_a_keyword_step_3_response_fields)

  

Path

Type

Description

`id`

`Number`

the id of the step

`test_case`

`Object`

the keyword test case this keyword step is part of

`index`

`Number`

the index of current keyword step in the keyword test case

`_links`

`Object`

related links

##### [Links](#_in_case_of_a_keyword_step_3_links)

 

Relation

Description

`self`

link to this keyword step

`keyword-test-case`

link to the keyword test case where this keyword step belongs

###  [![post](images/post.png) Link requirements to a test step](#_link_requirements_to_a_test_step)

A `POST` to `test-steps/{id}/coverages/{requirementIds}` links the requirements to the test step with the given id.

#### [Path parameters](#_link_requirements_to_a_test_step_path_parameters)

Table 6. /api/rest/latest/test-steps/{id}/coverages/{requirementIds}  

Parameter

Description

`id`

the id of the test step

`requirementIds`

the ids of the requirements to link

#### [HTTP request](#_link_requirements_to_a_test_step_http_request)

    POST /api/rest/latest/test-steps/235/coverages/12,13,14 HTTP/1.1
    Accept: application/json
    Host: localhost:8080
    Content-Type: application/x-www-form-urlencoded

#### [Example response](#_link_requirements_to_a_test_step_http_response)

    HTTP/1.1 200 OK
    Content-Type: application/json
    Content-Length: 1473
    
    {
      "_type" : "action-step",
      "id" : 235,
      "test_case" : {
        "_type" : "test-case",
        "id" : 120,
        "name" : "Door opening system",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/test-cases/120"
          }
        }
      },
      "action" : "<p>Wave your hand</p>",
      "expected_result" : "<p>The door opens</p>",
      "index" : 0,
      "custom_fields" : [ {
        "code" : "cuf_txt_note",
        "label" : "note",
        "value" : "Star Trek style welcomed but not mandatory"
      }, {
        "code" : "cuf_tags_see_also",
        "label" : "see also",
        "value" : [ "smart home", "sensors", "hand gesture" ]
      } ],
      "verified_requirements" : [ {
        "_type" : "requirement-version",
        "id" : 12,
        "name" : "My first requirement",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/requirement-versions/12"
          }
        }
      }, {
        "_type" : "requirement-version",
        "id" : 13,
        "name" : "My second requirement",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/requirement-versions/13"
          }
        }
      }, {
        "_type" : "requirement-version",
        "id" : 14,
        "name" : "My third requirement",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/requirement-versions/14"
          }
        }
      } ],
      "attachments" : [ ],
      "_links" : {
        "self" : {
          "href" : "http://localhost:8080/api/rest/latest/test-steps/235"
        }
      }
    }

###  [![delete](images/delete.png) Unlink requirements from a test step](#_unlink_requirements_from_a_test_step)

A `DELETE` to `test-steps/{id}/coverages/{requirementIds}` unlinks the requirements from the test step with the given id.

#### [Path parameters](#_unlink_requirements_from_a_test_step_path_parameters)

Table 6. /api/rest/latest/test-steps/{id}/coverages/{requirementIds}  

Parameter

Description

`id`

the id of the test step

`requirementIds`

the ids of the requirements to unlink

#### [HTTP request](#_unlink_requirements_from_a_test_step_http_request)

    DELETE /api/rest/latest/test-steps/235/coverages/12,14 HTTP/1.1
    Accept: application/json
    Host: localhost:8080